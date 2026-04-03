import type { BaseSpecDefinition, DetectedError, ParsedLog } from '../../types'

import { FROST_MAGE_COOLDOWNS, FROST_MAGE_SPELL_IDS } from './mage.frost.constants'

const FROZEN_ORB_GAP_MS = FROST_MAGE_COOLDOWNS.FROZEN_ORB_MS + 5_000
const FLURRY_ICE_LANCE_WINDOW_MS = 1_500
const BRAIN_FREEZE_REACTION_MS = 6_000
const FINGERS_OF_FROST_REACTION_MS = 8_000

export const frostMageBase: BaseSpecDefinition = {
  specKey: 'mage-frost',
  className: 'Mage',
  specName: 'Frost Mage',
  patchVersion: '11.1',
  supportedHeroTalents: ['frostfire', 'spellfrost'],

  rotationSummary:
    "Frost Mage revolves around the Brain Freeze proc chain: when Brain Freeze activates, cast instant Flurry immediately, then follow with Ice Lance inside the Winter's Chill window before the two stacks expire (the shatter combo). " +
    'Fingers of Frost procs also convert Ice Lance into a shatter — spend each proc with Ice Lance before generating more. ' +
    'Frozen Orb should be used on cooldown as it is the primary generator of both Brain Freeze and Fingers of Frost procs throughout the fight. ' +
    'Glacial Spike is only worth casting when you have 5 Icicles stacked; casting it earlier discards potential shatter damage. ' +
    'Icy Veins is your major cooldown and should be aligned with high proc density and trinket activation for maximum burst value. ' +
    'Frostbolt serves as the filler spell when no procs are active — keep casting to build Icicles and fish for Brain Freeze. ' +
    'Never let Brain Freeze or Fingers of Frost overlap passively; spend each proc before the next one generates to avoid wasting shatter windows.',

  spellIds: {
    Frostbolt: FROST_MAGE_SPELL_IDS.FROSTBOLT,
    Flurry: FROST_MAGE_SPELL_IDS.FLURRY,
    'Ice Lance': FROST_MAGE_SPELL_IDS.ICE_LANCE,
    'Frozen Orb': FROST_MAGE_SPELL_IDS.FROZEN_ORB,
    Blizzard: FROST_MAGE_SPELL_IDS.BLIZZARD,
    'Glacial Spike': FROST_MAGE_SPELL_IDS.GLACIAL_SPIKE,
    'Icy Veins': FROST_MAGE_SPELL_IDS.ICY_VEINS,
    'Comet Storm': FROST_MAGE_SPELL_IDS.COMET_STORM,
    'Brain Freeze': FROST_MAGE_SPELL_IDS.BRAIN_FREEZE,
    'Fingers of Frost': FROST_MAGE_SPELL_IDS.FINGERS_OF_FROST,
    "Winter's Chill": FROST_MAGE_SPELL_IDS.WINTERS_CHILL,
  },

  commonMistakes: [
    'Letting Brain Freeze expire without casting Flurry, discarding a free instant shatter window.',
    "Failing to cast Ice Lance immediately after Flurry, wasting both Winter's Chill stacks.",
    'Holding Frozen Orb well past its cooldown, dramatically reducing total proc generation over a fight.',
    'Casting Glacial Spike before reaching 5 Icicles, throwing away potential shatter damage.',
    'Delaying Icy Veins or not aligning it with proc density, reducing the value of the major burst window.',
  ],

  rules: [
    {
      id: 'frost-base-001',
      name: 'Brain Freeze Expired Unused',
      severity: 'critical',
      description: 'Brain Freeze expired without a Flurry cast during the window.',
      whyItMatters:
        "Brain Freeze converts your next Flurry into an instant cast that applies Winter's Chill, enabling the shatter combo. Letting it expire is a total loss of the proc and the shatter window it enables.",
      howToFix: `Cast Flurry within ${BRAIN_FREEZE_REACTION_MS / 1000}s whenever Brain Freeze activates. It is the highest-priority proc in the Frost rotation.`,
      detect(log: ParsedLog): DetectedError[] {
        const errors: DetectedError[] = []
        const flurryCasts = log.castEvents.filter(
          (e) => e.spellId === FROST_MAGE_SPELL_IDS.FLURRY && e.success,
        )
        const gains = log.buffEvents.filter(
          (e) => e.spellId === FROST_MAGE_SPELL_IDS.BRAIN_FREEZE && e.type === 'gained',
        )
        const expirations = log.buffEvents.filter(
          (e) => e.spellId === FROST_MAGE_SPELL_IDS.BRAIN_FREEZE && e.type === 'expired',
        )

        for (const expiry of expirations) {
          const lastGain = [...gains].reverse().find((g) => g.timestampMs < expiry.timestampMs)
          if (lastGain === undefined) continue
          const usedFlurry = flurryCasts.some(
            (c) => c.timestampMs > lastGain.timestampMs && c.timestampMs < expiry.timestampMs,
          )
          if (!usedFlurry) {
            errors.push({
              ruleId: 'frost-base-001',
              timestamp: expiry.timestamp,
              context: `Brain Freeze gained at ${lastGain.timestamp} expired unused at ${expiry.timestamp}`,
            })
          }
        }
        return errors
      },
    },
    {
      id: 'frost-base-002',
      name: 'Ice Lance Not Cast After Flurry',
      severity: 'critical',
      description: `Flurry cast with no Ice Lance in the following ${FLURRY_ICE_LANCE_WINDOW_MS}ms shatter window.`,
      whyItMatters:
        "Flurry's projectiles apply 2 stacks of Winter's Chill during travel time. Ice Lance must land inside that window to shatter. Missing it wastes both stacks and the entire combo.",
      howToFix:
        'Cast Ice Lance immediately after every Flurry. Do not cast any other spell between Flurry and Ice Lance.',
      detect(log: ParsedLog): DetectedError[] {
        const iceLanceCasts = log.castEvents.filter(
          (e) => e.spellId === FROST_MAGE_SPELL_IDS.ICE_LANCE && e.success,
        )
        return log.castEvents
          .filter((e) => e.spellId === FROST_MAGE_SPELL_IDS.FLURRY && e.success)
          .filter((flurry) => {
            const windowEnd = flurry.timestampMs + FLURRY_ICE_LANCE_WINDOW_MS
            return !iceLanceCasts.some(
              (il) => il.timestampMs > flurry.timestampMs && il.timestampMs <= windowEnd,
            )
          })
          .map((flurry) => ({
            ruleId: 'frost-base-002',
            timestamp: flurry.timestamp,
            context: `Flurry cast at ${flurry.timestamp} with no Ice Lance within ${FLURRY_ICE_LANCE_WINDOW_MS}ms`,
          }))
      },
    },
    {
      id: 'frost-base-003',
      name: 'Fingers of Frost Expired Unused',
      severity: 'moderate',
      description: 'Fingers of Frost expired without an Ice Lance cast during the window.',
      whyItMatters:
        'Fingers of Frost makes your next Ice Lance shatter as if the target were frozen, adding significant damage. Letting it expire is a wasted shatter.',
      howToFix: `Spend each Fingers of Frost charge with Ice Lance before generating more. React within ${FINGERS_OF_FROST_REACTION_MS / 1000}s of the proc appearing.`,
      detect(log: ParsedLog): DetectedError[] {
        const errors: DetectedError[] = []
        const iceLanceCasts = log.castEvents.filter(
          (e) => e.spellId === FROST_MAGE_SPELL_IDS.ICE_LANCE && e.success,
        )
        const gains = log.buffEvents.filter(
          (e) => e.spellId === FROST_MAGE_SPELL_IDS.FINGERS_OF_FROST && e.type === 'gained',
        )
        const expirations = log.buffEvents.filter(
          (e) => e.spellId === FROST_MAGE_SPELL_IDS.FINGERS_OF_FROST && e.type === 'expired',
        )

        for (const expiry of expirations) {
          const lastGain = [...gains].reverse().find((g) => g.timestampMs < expiry.timestampMs)
          if (lastGain === undefined) continue
          const spent = iceLanceCasts.some(
            (c) => c.timestampMs > lastGain.timestampMs && c.timestampMs < expiry.timestampMs,
          )
          if (!spent) {
            errors.push({
              ruleId: 'frost-base-003',
              timestamp: expiry.timestamp,
              context: `Fingers of Frost gained at ${lastGain.timestamp} expired unused at ${expiry.timestamp}`,
            })
          }
        }
        return errors
      },
    },
    {
      id: 'frost-base-004',
      name: 'Frozen Orb Not Used on Cooldown',
      severity: 'moderate',
      description: `Gap of more than ${FROZEN_ORB_GAP_MS / 1000}s between Frozen Orb casts.`,
      whyItMatters:
        'Frozen Orb is the primary source of both Brain Freeze and Fingers of Frost procs. Holding it past its cooldown starves the rotation of procs and reduces total damage significantly.',
      howToFix: 'Cast Frozen Orb as soon as it becomes available. It should always be on cooldown.',
      detect(log: ParsedLog): DetectedError[] {
        const casts = log.castEvents
          .filter((e) => e.spellId === FROST_MAGE_SPELL_IDS.FROZEN_ORB && e.success)
          .sort((a, b) => a.timestampMs - b.timestampMs)

        if (casts.length === 0) return []

        const errors: DetectedError[] = []
        let prevMs = 0

        for (const cast of casts) {
          const gap = cast.timestampMs - prevMs
          if (gap > FROZEN_ORB_GAP_MS) {
            errors.push({
              ruleId: 'frost-base-004',
              timestamp: cast.timestamp,
              context: `${Math.round(gap / 1000)}s gap before Frozen Orb cast at ${cast.timestamp}`,
            })
          }
          prevMs = cast.timestampMs
        }
        return errors
      },
    },
  ],
}
