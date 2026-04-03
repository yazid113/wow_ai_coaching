import type { BaseSpecDefinition, DetectedError, ParsedLog } from '../../types'

import { FIRE_MAGE_SPELL_IDS } from './mage.fire.constants'

function isBuffActive(log: ParsedLog, spellId: string, atMs: number): boolean {
  let active = false
  for (const e of log.buffEvents) {
    if (e.spellId !== spellId || e.timestampMs > atMs) continue
    if (e.type === 'gained' || e.type === 'refreshed') active = true
    else if (e.type === 'expired') active = false
  }
  return active
}

const PHOENIX_FLAMES_CAP_GAP_MS = 20_000

export const fireMageBase: BaseSpecDefinition = {
  specKey: 'mage-fire',
  className: 'Mage',
  specName: 'Fire Mage',
  patchVersion: '11.1',
  supportedHeroTalents: ['sunfury', 'spellslinger'],

  rotationSummary:
    'Fire Mage revolves around the Heating Up → Hot Streak proc chain: every crit on a direct-damage spell triggers Heating Up, and a second crit while Heating Up is active upgrades it to Hot Streak. ' +
    'Fire Blast is a guaranteed crit and should be used exclusively to convert an existing Heating Up into Hot Streak — never cast it without Heating Up already active. ' +
    'Hot Streak must be spent immediately on Pyroblast (single target) or Flamestrike (AoE); letting it expire is a critical error. ' +
    'Phoenix Flames is a charge-based proc-fishing tool — use it on cooldown to generate Heating Up and prevent charges from capping. ' +
    'Combustion dramatically increases crit chance and should be aligned with trinket procs and cooldowns for maximum burst damage. ' +
    'Scorch is a movement-only filler; casting it while stationary is a meaningful DPS loss.',

  spellIds: {
    Fireball: FIRE_MAGE_SPELL_IDS.FIREBALL,
    Pyroblast: FIRE_MAGE_SPELL_IDS.PYROBLAST,
    'Fire Blast': FIRE_MAGE_SPELL_IDS.FIRE_BLAST,
    'Phoenix Flames': FIRE_MAGE_SPELL_IDS.PHOENIX_FLAMES,
    Scorch: FIRE_MAGE_SPELL_IDS.SCORCH,
    Flamestrike: FIRE_MAGE_SPELL_IDS.FLAMESTRIKE,
    Combustion: FIRE_MAGE_SPELL_IDS.COMBUSTION,
    'Heating Up': FIRE_MAGE_SPELL_IDS.HEATING_UP,
    'Hot Streak': FIRE_MAGE_SPELL_IDS.HOT_STREAK,
  },

  commonMistakes: [
    'Casting Fire Blast without Heating Up active, wasting a charge and breaking the proc chain.',
    'Letting Hot Streak expire without casting Pyroblast or Flamestrike.',
    'Holding Phoenix Flames charges until they cap instead of using them on cooldown to fish for procs.',
    'Casting Scorch while standing still instead of hard-casting Fireball for higher damage.',
    'Delaying Combustion or not aligning it with trinket procs, significantly reducing burst window value.',
  ],

  rules: [
    {
      id: 'fire-base-001',
      name: 'Fire Blast Without Heating Up',
      severity: 'critical',
      description: 'Fire Blast was cast without Heating Up active.',
      whyItMatters:
        'Fire Blast exists solely to convert Heating Up into Hot Streak. Casting it without Heating Up wastes a charge and delays your entire proc chain.',
      howToFix:
        'Only press Fire Blast when the Heating Up buff is active. Wait for a Fireball or Pyroblast crit to trigger Heating Up first.',
      detect(log: ParsedLog): DetectedError[] {
        return log.castEvents
          .filter((e) => e.spellId === FIRE_MAGE_SPELL_IDS.FIRE_BLAST && e.success)
          .filter((e) => !isBuffActive(log, FIRE_MAGE_SPELL_IDS.HEATING_UP, e.timestampMs))
          .map((e) => ({
            ruleId: 'fire-base-001',
            timestamp: e.timestamp,
            context: `Fire Blast cast at ${e.timestamp} without Heating Up active`,
          }))
      },
    },
    {
      id: 'fire-base-002',
      name: 'Hot Streak Expired Unused',
      severity: 'critical',
      description: 'Hot Streak expired without being consumed by Pyroblast or Flamestrike.',
      whyItMatters:
        'Hot Streak is your highest-priority spender. Every expired proc is a free instant-cast Pyroblast discarded, representing a major DPS loss.',
      howToFix:
        'Cast Pyroblast (single target) or Flamestrike (AoE) immediately when Hot Streak procs. Never let it expire.',
      detect(log: ParsedLog): DetectedError[] {
        return log.buffEvents
          .filter((e) => e.spellId === FIRE_MAGE_SPELL_IDS.HOT_STREAK && e.type === 'expired')
          .map((e) => ({
            ruleId: 'fire-base-002',
            timestamp: e.timestamp,
            context: `Hot Streak expired unused at ${e.timestamp}`,
          }))
      },
    },
    {
      id: 'fire-base-003',
      name: 'Scorch Cast Detected',
      severity: 'moderate',
      description: 'Scorch was cast during the fight.',
      whyItMatters:
        'Scorch deals significantly less damage than Fireball and should only be used during forced movement. Standing casts are a DPS loss.',
      howToFix:
        'Reserve Scorch strictly for movement where you cannot complete a Fireball cast. If stationary, always hard-cast Fireball.',
      detect(log: ParsedLog): DetectedError[] {
        return log.castEvents
          .filter((e) => e.spellId === FIRE_MAGE_SPELL_IDS.SCORCH && e.success)
          .map((e) => ({
            ruleId: 'fire-base-003',
            timestamp: e.timestamp,
            context: `Scorch cast at ${e.timestamp} — flagged for AI review (movement cannot be confirmed from log)`,
          }))
      },
    },
    {
      id: 'fire-base-004',
      name: 'Phoenix Flames Charges Capping',
      severity: 'moderate',
      description: `No Phoenix Flames cast for over ${PHOENIX_FLAMES_CAP_GAP_MS / 1000}s, suggesting charge capping.`,
      whyItMatters:
        'Capping Phoenix Flames charges wastes free crit opportunities and stalls the Heating Up proc chain.',
      howToFix:
        'Use Phoenix Flames on cooldown as a proc-fishing tool. Treat each charge as a free Heating Up generator.',
      detect(log: ParsedLog): DetectedError[] {
        const casts = log.castEvents
          .filter((e) => e.spellId === FIRE_MAGE_SPELL_IDS.PHOENIX_FLAMES && e.success)
          .sort((a, b) => a.timestampMs - b.timestampMs)

        if (casts.length === 0) return []

        const errors: DetectedError[] = []
        let prevMs = 0

        for (const cast of casts) {
          const gap = cast.timestampMs - prevMs
          if (gap > PHOENIX_FLAMES_CAP_GAP_MS) {
            errors.push({
              ruleId: 'fire-base-004',
              timestamp: cast.timestamp,
              context: `${Math.round(gap / 1000)}s gap before Phoenix Flames cast at ${cast.timestamp}`,
            })
          }
          prevMs = cast.timestampMs
        }
        return errors
      },
    },
  ],
}
