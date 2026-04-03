import type { DetectedError, HeroTalentOverlay, ParsedLog } from '../../types'

import { FROST_MAGE_SPELL_IDS } from './mage.frost.constants'

const SPELLFROST_MAX_STACKS = 8
const SPELLFROST_BOLT_REACTION_MS = 3_000

export const frostMageSpellfrost: HeroTalentOverlay = {
  heroTalentTree: 'spellfrost',
  displayName: 'Spellfrost',

  additionalContext:
    'Spellfrost enhances the Frozen Orb and Blizzard toolkit: channelling Frozen Orb builds Spellfrost Teachings stacks, which amplify the next Spellfrost Bolt cast with stacking bonus damage. ' +
    'Spellfrost Bolt must be cast before the Teachings stacks expire — holding stacks too long or ignoring them entirely discards significant burst damage tied to the Frozen Orb cooldown. ' +
    'At high stack counts (8+) Spellfrost Bolt becomes the highest-priority cast in the rotation, overriding even the standard Brain Freeze → Flurry → Ice Lance chain until it is consumed. ' +
    'This creates a secondary priority layer on top of the base Frost shatter loop: track Spellfrost Teachings stacks and treat max-stack Spellfrost Bolt as an interrupt-level priority.',

  removedRuleIds: [],

  additionalRules: [
    {
      id: 'frost-spellfrost-001',
      name: 'Spellfrost Bolt Not Cast at Max Teachings Stacks',
      severity: 'critical',
      description: `Spellfrost Teachings reached ${SPELLFROST_MAX_STACKS} stacks with no Spellfrost Bolt cast within ${SPELLFROST_BOLT_REACTION_MS / 1000}s.`,
      whyItMatters:
        'At max stacks, Spellfrost Bolt deals its maximum amplified damage and stacks will begin decaying. Delaying or missing the cast here is the single largest DPS error in the Spellfrost tree.',
      howToFix: `Cast Spellfrost Bolt immediately when Spellfrost Teachings reaches ${SPELLFROST_MAX_STACKS} stacks. This is a higher priority than all other casts except spending an already-active Brain Freeze.`,
      detect(log: ParsedLog): DetectedError[] {
        const errors: DetectedError[] = []
        const spellBoltCasts = log.castEvents.filter(
          (e) => e.spellId === FROST_MAGE_SPELL_IDS.SPELLFROST_BOLT && e.success,
        )

        for (const buffEvent of log.buffEvents) {
          if (
            buffEvent.spellId !== FROST_MAGE_SPELL_IDS.SPELLFROST_TEACHINGS ||
            buffEvent.type !== 'gained'
          )
            continue

          // Use resource events to detect stack count — fall back to buff event pattern
          const stackAtEvent = log.resourceEvents.find(
            (r) =>
              Math.abs(r.timestampMs - buffEvent.timestampMs) < 200 && r.resourceType === 'stacks',
          )
          const stacks = stackAtEvent?.total ?? 0
          if (stacks < SPELLFROST_MAX_STACKS) continue

          const windowEnd = buffEvent.timestampMs + SPELLFROST_BOLT_REACTION_MS
          const cast = spellBoltCasts.some(
            (c) => c.timestampMs > buffEvent.timestampMs && c.timestampMs <= windowEnd,
          )
          if (!cast) {
            errors.push({
              ruleId: 'frost-spellfrost-001',
              timestamp: buffEvent.timestamp,
              context: `Spellfrost Teachings at ${stacks} stacks at ${buffEvent.timestamp} with no Spellfrost Bolt within ${SPELLFROST_BOLT_REACTION_MS / 1000}s`,
            })
          }
        }
        return errors
      },
    },
    {
      id: 'frost-spellfrost-002',
      name: 'Spellfrost Teachings Stacks Expired Unused',
      severity: 'moderate',
      description:
        'Spellfrost Teachings expired with stacks remaining and no Spellfrost Bolt cast during the window.',
      whyItMatters:
        'Each Spellfrost Teachings stack represents bonus Spellfrost Bolt damage built from Frozen Orb. Letting stacks expire wastes all accumulated bonus damage from that Frozen Orb cast.',
      howToFix:
        'Always cast Spellfrost Bolt before Spellfrost Teachings expires. Use Frozen Orb → Spellfrost Bolt as a paired cooldown sequence.',
      detect(log: ParsedLog): DetectedError[] {
        const errors: DetectedError[] = []
        const spellBoltCasts = log.castEvents.filter(
          (e) => e.spellId === FROST_MAGE_SPELL_IDS.SPELLFROST_BOLT && e.success,
        )
        const gains = log.buffEvents.filter(
          (e) => e.spellId === FROST_MAGE_SPELL_IDS.SPELLFROST_TEACHINGS && e.type === 'gained',
        )
        const expirations = log.buffEvents.filter(
          (e) => e.spellId === FROST_MAGE_SPELL_IDS.SPELLFROST_TEACHINGS && e.type === 'expired',
        )

        for (const expiry of expirations) {
          const lastGain = [...gains].reverse().find((g) => g.timestampMs < expiry.timestampMs)
          if (lastGain === undefined) continue
          const spent = spellBoltCasts.some(
            (c) => c.timestampMs > lastGain.timestampMs && c.timestampMs < expiry.timestampMs,
          )
          if (!spent) {
            errors.push({
              ruleId: 'frost-spellfrost-002',
              timestamp: expiry.timestamp,
              context: `Spellfrost Teachings gained at ${lastGain.timestamp} expired unused at ${expiry.timestamp}`,
            })
          }
        }
        return errors
      },
    },
  ],

  additionalMistakes: [
    'Ignoring Spellfrost Teachings stacks entirely and never casting Spellfrost Bolt, losing all bonus damage from Frozen Orb channels.',
    'Casting Spellfrost Bolt at low stack counts (1–3) instead of waiting to maximise the damage amplification before spending.',
  ],

  spellIds: {
    'Spellfrost Teachings': FROST_MAGE_SPELL_IDS.SPELLFROST_TEACHINGS,
    'Spellfrost Bolt': FROST_MAGE_SPELL_IDS.SPELLFROST_BOLT,
  },
}
