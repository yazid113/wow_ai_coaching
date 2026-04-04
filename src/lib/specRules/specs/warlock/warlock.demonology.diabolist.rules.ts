import type { DetectedError, ParsedLog } from '../../types'

export const DEMO_WARLOCK_SPELL_IDS = {
  HAND_OF_GULDAN: '105174',
  CALL_DREADSTALKERS: '104316',
  DEMONIC_TYRANT: '265187',
  VILEFIEND: '264119',
  DEMONBOLT: '264178',
  SHADOW_BOLT: '686',
  DOOM: '603',
  DEMONIC_CORE: '267102',
  WILD_IMP: '104315',
  DIABOLIC_RITUAL: '428514',
  ABYSSAL_DOMINION: '429899',
  INFERNAL_BOLT: '434473',
} as const

const HOG_MIN_SHARDS = 3
const DREADSTALKERS_MAX_GAP_MS = 25_000
const VILEFIEND_MAX_GAP_MS = 50_000

export function detectHogLowShards(log: ParsedLog): DetectedError[] {
  const hogCasts = log.castEvents
    .filter((e) => e.spellId === DEMO_WARLOCK_SPELL_IDS.HAND_OF_GULDAN && e.success)
    .sort((a, b) => a.timestampMs - b.timestampMs)

  if (hogCasts.length < 2) return []

  const violations: DetectedError[] = []
  const MIN_REBUILD_MS = 3_000

  for (let i = 1; i < hogCasts.length; i++) {
    const prev = hogCasts[i - 1]!
    const curr = hogCasts[i]!
    const gapMs = curr.timestampMs - prev.timestampMs

    if (gapMs < MIN_REBUILD_MS) {
      violations.push({
        ruleId: 'det-demo-001',
        timestamp: curr.timestamp,
        context:
          `Hand of Gul'dan cast at ${curr.timestamp} only ${Math.round(gapMs / 1000)}s after previous cast — ` +
          `likely fewer than ${HOG_MIN_SHARDS} Soul Shards spent, summoning fewer imps than optimal`,
      })
    }
  }

  return violations
}

export function detectDreadstalkersCooldownDelay(log: ParsedLog): DetectedError[] {
  const casts = log.castEvents
    .filter((e) => e.spellId === DEMO_WARLOCK_SPELL_IDS.CALL_DREADSTALKERS && e.success)
    .sort((a, b) => a.timestampMs - b.timestampMs)

  if (casts.length < 2) return []

  const violations: DetectedError[] = []

  for (let i = 1; i < casts.length; i++) {
    const prev = casts[i - 1]!
    const curr = casts[i]!
    const gapMs = curr.timestampMs - prev.timestampMs

    if (gapMs > DREADSTALKERS_MAX_GAP_MS) {
      violations.push({
        ruleId: 'det-demo-002',
        timestamp: curr.timestamp,
        context:
          `Call Dreadstalkers cast at ${curr.timestamp} after a ${Math.round(gapMs / 1000)}s gap — ` +
          `cooldown appears to have been delayed (20s CD, expected gap ≤${DREADSTALKERS_MAX_GAP_MS / 1000}s)`,
      })
    }
  }

  return violations
}

export function detectVilefiendCooldownDelay(log: ParsedLog): DetectedError[] {
  const casts = log.castEvents
    .filter((e) => e.spellId === DEMO_WARLOCK_SPELL_IDS.VILEFIEND && e.success)
    .sort((a, b) => a.timestampMs - b.timestampMs)

  if (casts.length < 2) return []

  const violations: DetectedError[] = []

  for (let i = 1; i < casts.length; i++) {
    const prev = casts[i - 1]!
    const curr = casts[i]!
    const gapMs = curr.timestampMs - prev.timestampMs

    if (gapMs > VILEFIEND_MAX_GAP_MS) {
      violations.push({
        ruleId: 'det-demo-003',
        timestamp: curr.timestamp,
        context:
          `Vilefiend cast at ${curr.timestamp} after a ${Math.round(gapMs / 1000)}s gap — ` +
          `cooldown appears to have been delayed (45s CD, expected gap ≤${VILEFIEND_MAX_GAP_MS / 1000}s)`,
      })
    }
  }

  return violations
}

export function detectTyrantLowDemonCount(log: ParsedLog): DetectedError[] {
  const tyrantCasts = log.castEvents
    .filter((e) => e.spellId === DEMO_WARLOCK_SPELL_IDS.DEMONIC_TYRANT && e.success)
    .sort((a, b) => a.timestampMs - b.timestampMs)

  if (tyrantCasts.length === 0) return []

  const SUMMON_SPELL_IDS = new Set([
    DEMO_WARLOCK_SPELL_IDS.HAND_OF_GULDAN,
    DEMO_WARLOCK_SPELL_IDS.CALL_DREADSTALKERS,
    DEMO_WARLOCK_SPELL_IDS.VILEFIEND,
  ])

  const TYRANT_WINDOW_MS = 15_000
  const MIN_SUMMON_CASTS = 2
  const violations: DetectedError[] = []

  for (const tyrant of tyrantCasts) {
    const summonsBeforeTyrant = log.castEvents.filter(
      (e) =>
        SUMMON_SPELL_IDS.has(e.spellId) &&
        e.success &&
        e.timestampMs >= tyrant.timestampMs - TYRANT_WINDOW_MS &&
        e.timestampMs < tyrant.timestampMs,
    )

    if (summonsBeforeTyrant.length < MIN_SUMMON_CASTS) {
      violations.push({
        ruleId: 'det-demo-diab-001',
        timestamp: tyrant.timestamp,
        context:
          `Demonic Tyrant cast at ${tyrant.timestamp} with only ${summonsBeforeTyrant.length} summon spell(s) in the preceding ${TYRANT_WINDOW_MS / 1000}s — ` +
          `Tyrant empowers active demons; casting with few demons active wastes the cooldown`,
      })
    }
  }

  return violations
}

export function detectMissedInfernalBoltDuringRitual(log: ParsedLog): DetectedError[] {
  const ritualGains = log.buffEvents.filter(
    (e) =>
      e.spellId === DEMO_WARLOCK_SPELL_IDS.DIABOLIC_RITUAL &&
      (e.type === 'gained' || e.type === 'refreshed'),
  )

  if (ritualGains.length === 0) return []

  const violations: DetectedError[] = []
  const RITUAL_DURATION_MS = 20_000

  for (const gain of ritualGains) {
    const windowEnd = gain.timestampMs + RITUAL_DURATION_MS

    const infernalBoltCasts = log.castEvents.filter(
      (e) =>
        e.spellId === DEMO_WARLOCK_SPELL_IDS.INFERNAL_BOLT &&
        e.success &&
        e.timestampMs >= gain.timestampMs &&
        e.timestampMs < windowEnd,
    )

    const shadowBoltCasts = log.castEvents.filter(
      (e) =>
        e.spellId === DEMO_WARLOCK_SPELL_IDS.SHADOW_BOLT &&
        e.success &&
        e.timestampMs >= gain.timestampMs &&
        e.timestampMs < windowEnd,
    )

    if (infernalBoltCasts.length === 0 && shadowBoltCasts.length > 0) {
      violations.push({
        ruleId: 'det-demo-diab-002',
        timestamp: gain.timestamp,
        context:
          `Diabolic Ritual active at ${gain.timestamp}: ${shadowBoltCasts.length} Shadow Bolt(s) cast but 0 Infernal Bolt(s) — ` +
          `Infernal Bolt replaces Shadow Bolt during Diabolic Ritual and should be used instead`,
      })
    }
  }

  return violations
}
