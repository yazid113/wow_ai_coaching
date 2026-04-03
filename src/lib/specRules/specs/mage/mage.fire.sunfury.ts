import type { DetectedError, HeroTalentOverlay, ParsedLog } from '../../types'

import { FIRE_MAGE_SPELL_IDS } from './mage.fire.constants'

const ARCANE_SOUL_REACTION_MS = 4_000

export const fireMageSunfury: HeroTalentOverlay = {
  heroTalentTree: 'sunfury',
  displayName: 'Sunfury',

  additionalContext:
    'Sunfury enhances Combustion burst windows through two interlocking mechanics: Arcane Soul procs empower your next Pyroblast and must be consumed immediately or the damage bonus is lost. ' +
    "Phoenix Reborn causes Phoenix Flames to occasionally reset Combustion's cooldown mid-window — casting Phoenix Flames as many times as possible during Combustion is now a priority, not just a proc-fishing tool. " +
    'Gleaming Cinders is a stacking debuff applied by Pyroblast that amplifies fire damage taken, making high Pyroblast volume inside Combustion critical for window value. ' +
    "These mechanics shift Sunfury's cooldown priority toward maximising Pyroblast count inside Combustion and casting Phoenix Flames aggressively throughout the burst window.",

  removedRuleIds: [],

  additionalRules: [
    {
      id: 'fire-sunfury-001',
      name: 'Combustion Without Phoenix Reborn Context',
      severity: 'critical',
      description:
        'Combustion was cast — flagged with Phoenix Flames timing context for AI evaluation of Phoenix Reborn alignment.',
      whyItMatters:
        'Phoenix Reborn can reset Combustion mid-window if Phoenix Flames is cast during it. Poor Phoenix Flames timing inside Combustion wastes the potential for an extended burst window.',
      howToFix:
        'Cast Phoenix Flames as early and as often as possible inside every Combustion window to fish for Phoenix Reborn resets.',
      detect(log: ParsedLog): DetectedError[] {
        const pfCasts = log.castEvents.filter(
          (e) => e.spellId === FIRE_MAGE_SPELL_IDS.PHOENIX_FLAMES && e.success,
        )

        return log.castEvents
          .filter((e) => e.spellId === FIRE_MAGE_SPELL_IDS.COMBUSTION && e.success)
          .map((combustion) => {
            const nextPf = pfCasts.find((c) => c.timestampMs > combustion.timestampMs)
            const context = nextPf
              ? `Combustion at ${combustion.timestamp}; next Phoenix Flames at ${nextPf.timestamp} (${Math.round((nextPf.timestampMs - combustion.timestampMs) / 1000)}s later) — review Phoenix Reborn alignment`
              : `Combustion at ${combustion.timestamp}; no subsequent Phoenix Flames cast found — Phoenix Reborn unused`
            return { ruleId: 'fire-sunfury-001', timestamp: combustion.timestamp, context }
          })
      },
    },
    {
      id: 'fire-sunfury-002',
      name: 'Arcane Soul Proc Wasted',
      severity: 'moderate',
      description: `Arcane Soul buff gained but no Pyroblast cast within ${ARCANE_SOUL_REACTION_MS / 1000}s.`,
      whyItMatters:
        'Arcane Soul empowers your next Pyroblast with bonus damage. Failing to consume it promptly discards a significant damage bonus unique to Sunfury.',
      howToFix:
        'Treat Arcane Soul as a highest-priority proc — cast Pyroblast immediately when the buff appears, ahead of all other decisions except spending an existing Hot Streak.',
      detect(log: ParsedLog): DetectedError[] {
        const errors: DetectedError[] = []

        const soulGains = log.buffEvents.filter(
          (e) => e.spellId === FIRE_MAGE_SPELL_IDS.ARCANE_SOUL && e.type === 'gained',
        )

        for (const gain of soulGains) {
          const reactionWindow = gain.timestampMs + ARCANE_SOUL_REACTION_MS
          const acted = log.castEvents.some(
            (c) =>
              c.spellId === FIRE_MAGE_SPELL_IDS.PYROBLAST &&
              c.success &&
              c.timestampMs > gain.timestampMs &&
              c.timestampMs <= reactionWindow,
          )
          if (!acted) {
            errors.push({
              ruleId: 'fire-sunfury-002',
              timestamp: gain.timestamp,
              context: `Arcane Soul gained at ${gain.timestamp} with no Pyroblast within ${ARCANE_SOUL_REACTION_MS / 1000}s`,
            })
          }
        }
        return errors
      },
    },
  ],

  additionalMistakes: [
    'Ignoring Arcane Soul procs instead of immediately casting Pyroblast to consume the empowered damage bonus.',
    'Failing to cast Phoenix Flames during Combustion windows, missing potential Phoenix Reborn resets that could extend the burst.',
    'Letting Gleaming Cinders stacks drop between Combustion windows by delaying or skipping Pyroblast casts.',
  ],

  spellIds: {
    'Arcane Soul': FIRE_MAGE_SPELL_IDS.ARCANE_SOUL,
    'Phoenix Reborn': FIRE_MAGE_SPELL_IDS.PHOENIX_REBORN,
    'Gleaming Cinders': FIRE_MAGE_SPELL_IDS.GLEAMING_CINDERS,
  },
}
