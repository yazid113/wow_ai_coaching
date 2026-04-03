import type { DetectedError, HeroTalentOverlay, ParsedLog } from '../../types'

import { FROST_MAGE_SPELL_IDS } from './mage.frost.constants'

const FROSTFIRE_EMPOWERMENT_REACTION_MS = 4_000

export const frostMageFrostfire: HeroTalentOverlay = {
  heroTalentTree: 'frostfire',
  displayName: 'Frostfire',

  additionalContext:
    'Frostfire weaves Fire magic into the Frost rotation: Frostfire Bolt replaces some Frostbolt casts and generates both Excess Frost and Excess Fire procs from the combined element damage. ' +
    'Frostfire Empowerment empowers the next Frostfire Bolt cast with amplified damage — this proc must be consumed immediately as it functions like a Combustion-adjacent mini-burst window. ' +
    'Excess Frost feeds the Brain Freeze and Fingers of Frost proc chain, while Excess Fire provides additional direct damage on top of the Frost shatter combo. ' +
    'The rotation priority shifts to always consuming Frostfire Empowerment before returning to the standard shatter combo loop.',

  removedRuleIds: [],

  additionalRules: [
    {
      id: 'frost-frostfire-001',
      name: 'Frostfire Empowerment Not Consumed',
      severity: 'moderate',
      description: `Frostfire Empowerment was active but no Frostfire Bolt cast within ${FROSTFIRE_EMPOWERMENT_REACTION_MS / 1000}s.`,
      whyItMatters:
        'Frostfire Empowerment amplifies the next Frostfire Bolt significantly. Failing to consume it promptly — or at all — discards a major damage boost unique to the Frostfire tree.',
      howToFix:
        'Cast Frostfire Bolt immediately when Frostfire Empowerment activates. Treat it as higher priority than Frostbolt filler but lower than spending an active Brain Freeze.',
      detect(log: ParsedLog): DetectedError[] {
        const errors: DetectedError[] = []
        const frostfireCasts = log.castEvents.filter(
          (e) => e.spellId === FROST_MAGE_SPELL_IDS.FROSTFIRE_BOLT && e.success,
        )
        const gains = log.buffEvents.filter(
          (e) => e.spellId === FROST_MAGE_SPELL_IDS.FROSTFIRE_EMPOWERMENT && e.type === 'gained',
        )

        for (const gain of gains) {
          const windowEnd = gain.timestampMs + FROSTFIRE_EMPOWERMENT_REACTION_MS
          const consumed = frostfireCasts.some(
            (c) => c.timestampMs > gain.timestampMs && c.timestampMs <= windowEnd,
          )
          if (!consumed) {
            errors.push({
              ruleId: 'frost-frostfire-001',
              timestamp: gain.timestamp,
              context: `Frostfire Empowerment gained at ${gain.timestamp} with no Frostfire Bolt within ${FROSTFIRE_EMPOWERMENT_REACTION_MS / 1000}s`,
            })
          }
        }
        return errors
      },
    },
  ],

  additionalMistakes: [
    'Ignoring Frostfire Empowerment procs and continuing to cast Frostbolt, losing the amplified Frostfire Bolt damage.',
    'Casting Frostfire Bolt outside of Frostfire Empowerment windows when a Brain Freeze proc is available, prioritising the weaker spell over the shatter combo.',
  ],

  spellIds: {
    'Frostfire Bolt': FROST_MAGE_SPELL_IDS.FROSTFIRE_BOLT,
    'Frostfire Empowerment': FROST_MAGE_SPELL_IDS.FROSTFIRE_EMPOWERMENT,
    'Excess Frost': FROST_MAGE_SPELL_IDS.EXCESS_FROST,
    'Excess Fire': FROST_MAGE_SPELL_IDS.EXCESS_FIRE,
  },
}
