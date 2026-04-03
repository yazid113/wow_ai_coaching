import type { ParsedLog } from '@/lib/specRules/types'

import { isBuffActiveAt } from './buffStateTracker'
import type { BuffWindow } from './buffStateTracker'
import type { DeterministicViolation } from './engine.types'

// ─── Spell Reference ──────────────────────────────────────────────────────────

export const FIRE_MAGE_SPELL_NAMES = {
  FIRE_BLAST: 'Fire Blast',
  PYROBLAST: 'Pyroblast',
  PHOENIX_FLAMES: 'Phoenix Flames',
  HEATING_UP: 'Heating Up',
  HOT_STREAK: 'Hot Streak',
  SCORCH: 'Scorch',
  COMBUSTION: 'Combustion',
} as const

const FIRE_MAGE_SPELL_IDS = {
  FIRE_BLAST: '108853',
  PYROBLAST: '11366',
  PHOENIX_FLAMES: '257541',
  HEATING_UP: '48107',
  HOT_STREAK: '48108',
  SCORCH: '2948',
  COMBUSTION: '190319',
} as const

const PHOENIX_FLAMES_CAP_GAP_MS = 20_000

// ─── Rules ────────────────────────────────────────────────────────────────────

/**
 * det-fire-001 — Fire Blast cast without Heating Up active.
 * Wastes a charge and breaks the proc chain.
 */
export function detectFireBlastWithoutHeatingUp(
  log: ParsedLog,
  windows: BuffWindow[],
): DeterministicViolation[] {
  return log.castEvents
    .filter((e) => e.spellId === FIRE_MAGE_SPELL_IDS.FIRE_BLAST && e.success)
    .filter((e) => !isBuffActiveAt(windows, FIRE_MAGE_SPELL_NAMES.HEATING_UP, e.timestampMs))
    .map((e) => ({
      ruleId: 'det-fire-001',
      timestamp: e.timestamp,
      severity: 'critical' as const,
      title: 'Fire Blast Without Heating Up',
      context: `Fire Blast cast at ${e.timestamp} without Heating Up active`,
      spellName: FIRE_MAGE_SPELL_NAMES.FIRE_BLAST,
      buffState: { 'heating up': false },
      timestampMs: e.timestampMs,
    }))
}

/**
 * det-fire-001b — Fire Blast cast while Hot Streak was active without spending it first.
 * Correct sequence: Pyroblast (consume Hot Streak) → Fire Blast (rebuild Heating Up).
 */
export function detectFireBlastDuringHotStreak(
  log: ParsedLog,
  windows: BuffWindow[],
): DeterministicViolation[] {
  const LOOKBACK_MS = 500

  return log.castEvents
    .filter((e) => e.spellId === FIRE_MAGE_SPELL_IDS.FIRE_BLAST && e.success)
    .filter((e) => isBuffActiveAt(windows, FIRE_MAGE_SPELL_NAMES.HOT_STREAK, e.timestampMs))
    .filter((e) => {
      const pyroBeforeCast = log.castEvents.some(
        (p) =>
          p.spellId === FIRE_MAGE_SPELL_IDS.PYROBLAST &&
          p.success &&
          p.timestampMs >= e.timestampMs - LOOKBACK_MS &&
          p.timestampMs < e.timestampMs,
      )
      return !pyroBeforeCast
    })
    .map((e) => ({
      ruleId: 'det-fire-001b',
      timestamp: e.timestamp,
      severity: 'minor' as const,
      title: 'Fire Blast During Hot Streak',
      context: `Fire Blast used at ${e.timestamp} while Hot Streak was active — spend Hot Streak with Pyroblast before using Fire Blast`,
      spellName: FIRE_MAGE_SPELL_NAMES.FIRE_BLAST,
      buffState: { 'hot streak': true },
      timestampMs: e.timestampMs,
    }))
}

/**
 * det-fire-002 — Hot Streak expired without a Pyroblast cast during the window.
 */
export function detectHotStreakExpired(
  log: ParsedLog,
  windows: BuffWindow[],
): DeterministicViolation[] {
  const violations: DeterministicViolation[] = []

  const hotStreakWindows = windows.filter(
    (w) => w.spellId === FIRE_MAGE_SPELL_IDS.HOT_STREAK && w.endMs !== null,
  )

  for (const window of hotStreakWindows) {
    const endMs = window.endMs as number

    const pyroblastDuringWindow = log.castEvents.some(
      (e) =>
        e.spellId === FIRE_MAGE_SPELL_IDS.PYROBLAST &&
        e.success &&
        e.timestampMs >= window.startMs &&
        e.timestampMs < endMs,
    )

    if (!pyroblastDuringWindow) {
      const expiredEvent = log.buffEvents.find(
        (e) =>
          e.spellId === FIRE_MAGE_SPELL_IDS.HOT_STREAK &&
          e.type === 'expired' &&
          e.timestampMs === endMs,
      )
      const timestamp = expiredEvent?.timestamp ?? String(endMs)

      violations.push({
        ruleId: 'det-fire-002',
        timestamp,
        severity: 'critical',
        title: 'Hot Streak Expired Unused',
        context: `Hot Streak expired unused at ${timestamp} — no Pyroblast cast during the ${Math.round((endMs - window.startMs) / 1000)}s window`,
        spellName: FIRE_MAGE_SPELL_NAMES.HOT_STREAK,
        buffState: { 'hot streak': false },
        timestampMs: endMs,
      })
    }
  }

  return violations
}

/**
 * det-fire-003 — Phoenix Flames not cast for more than 20s (charge capping).
 */
export function detectPhoenixFlamesCap(log: ParsedLog): DeterministicViolation[] {
  const casts = log.castEvents
    .filter((e) => e.spellId === FIRE_MAGE_SPELL_IDS.PHOENIX_FLAMES && e.success)
    .sort((a, b) => a.timestampMs - b.timestampMs)

  if (casts.length < 2) return []

  const violations: DeterministicViolation[] = []

  for (let i = 1; i < casts.length; i++) {
    const prev = casts[i - 1]!
    const curr = casts[i]!
    const gapMs = curr.timestampMs - prev.timestampMs

    if (gapMs > PHOENIX_FLAMES_CAP_GAP_MS) {
      violations.push({
        ruleId: 'det-fire-003',
        timestamp: curr.timestamp,
        severity: 'moderate',
        title: 'Phoenix Flames Charges Capping',
        context: `${Math.round(gapMs / 1000)}s gap before Phoenix Flames cast at ${curr.timestamp} — charges likely capped`,
        spellName: FIRE_MAGE_SPELL_NAMES.PHOENIX_FLAMES,
        buffState: {},
        timestampMs: curr.timestampMs,
      })
    }
  }

  return violations
}

/**
 * det-fire-004 — Scorch cast outside of a Combustion window.
 * Cannot confirm movement from logs; flags for AI review.
 */
export function detectScorchWhileStationary(
  log: ParsedLog,
  windows: BuffWindow[],
): DeterministicViolation[] {
  return log.castEvents
    .filter((e) => e.spellId === FIRE_MAGE_SPELL_IDS.SCORCH && e.success)
    .filter((e) => !isBuffActiveAt(windows, FIRE_MAGE_SPELL_NAMES.COMBUSTION, e.timestampMs))
    .map((e) => ({
      ruleId: 'det-fire-004',
      timestamp: e.timestamp,
      severity: 'minor' as const,
      title: 'Scorch Outside Combustion',
      context: `Scorch cast at ${e.timestamp} outside Combustion — verify if movement was required`,
      spellName: FIRE_MAGE_SPELL_NAMES.SCORCH,
      buffState: { combustion: false },
      timestampMs: e.timestampMs,
    }))
}

/**
 * det-fire-005 — Combustion cast without Hot Streak active.
 */
export function detectCombustionDuringDowntime(
  log: ParsedLog,
  windows: BuffWindow[],
): DeterministicViolation[] {
  return log.castEvents
    .filter((e) => e.spellId === FIRE_MAGE_SPELL_IDS.COMBUSTION && e.success)
    .filter((e) => !isBuffActiveAt(windows, FIRE_MAGE_SPELL_NAMES.HOT_STREAK, e.timestampMs))
    .map((e) => ({
      ruleId: 'det-fire-005',
      timestamp: e.timestamp,
      severity: 'critical' as const,
      title: 'Combustion Without Hot Streak',
      context: `Combustion cast at ${e.timestamp} without Hot Streak active — misaligned burst window`,
      spellName: FIRE_MAGE_SPELL_NAMES.COMBUSTION,
      buffState: { 'hot streak': false },
      timestampMs: e.timestampMs,
    }))
}
