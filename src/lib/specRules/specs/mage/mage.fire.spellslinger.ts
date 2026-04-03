import type { DetectedError, HeroTalentOverlay, ParsedLog } from '../../types'

import { FIRE_MAGE_SPELL_IDS } from './mage.fire.constants'

const SPELLFROST_TEACHINGS_MAX_STACKS = 5
const SPELLFROST_BOLT_REACTION_MS = 3_000

/** Returns the current Spellfrost Teachings stack count at a given fight timestamp. */
function getSpellfrostStacksAt(log: ParsedLog, atMs: number): number {
  let stacks = 0
  for (const e of log.buffEvents) {
    if (e.spellId !== FIRE_MAGE_SPELL_IDS.SPELLFROST_TEACHINGS || e.timestampMs > atMs) continue
    if (e.type === 'gained') stacks = 1
    else if (e.type === 'refreshed') stacks += 1
    else if (e.type === 'expired') stacks = 0
  }
  return stacks
}

export const fireMageSpellslinger: HeroTalentOverlay = {
  heroTalentTree: 'spellslinger',
  displayName: 'Spellslinger',

  additionalContext:
    'Spellslinger transforms Fireball from filler into a stack-builder: each successful Fireball cast adds a Spellfrost Teachings stack up to a maximum of five. ' +
    "At maximum stacks Spellfrost Bolt becomes available and must be cast immediately — it deals substantial damage, consumes all stacks, and resets the cycle, making the Fireball-to-Spellfrost-Bolt loop the backbone of Spellslinger's rotation. " +
    'This means cast efficiency on Fireball is more consequential than in the base spec — delays or missed casts directly slow Spellfrost Teachings stack generation and reduce Spellfrost Bolt frequency. ' +
    'Slipstream allows Fireball to be channelled while moving, partially preserving stack generation during high-mobility fight phases.',

  removedRuleIds: [],

  additionalRules: [
    {
      id: 'fire-spellslinger-001',
      name: 'Spellfrost Teachings Max Stacks Not Consumed',
      severity: 'critical',
      description: `Spellfrost Teachings reached ${SPELLFROST_TEACHINGS_MAX_STACKS} stacks but Spellfrost Bolt was not cast within ${SPELLFROST_BOLT_REACTION_MS / 1000}s.`,
      whyItMatters:
        'Spellfrost Bolt at max stacks is the highest-damage cast in the Spellslinger loop. Delaying it stalls the stack cycle and wastes the proc window.',
      howToFix:
        'Cast Spellfrost Bolt immediately when Spellfrost Teachings reaches maximum stacks. Treat it as the same priority as a Hot Streak Pyroblast.',
      detect(log: ParsedLog): DetectedError[] {
        const errors: DetectedError[] = []
        let stacks = 0

        for (const e of log.buffEvents) {
          if (e.spellId !== FIRE_MAGE_SPELL_IDS.SPELLFROST_TEACHINGS) continue
          if (e.type === 'gained') stacks = 1
          else if (e.type === 'refreshed') stacks += 1
          else if (e.type === 'expired') {
            stacks = 0
            continue
          }

          if (stacks === SPELLFROST_TEACHINGS_MAX_STACKS) {
            const reactionWindow = e.timestampMs + SPELLFROST_BOLT_REACTION_MS
            const acted = log.castEvents.some(
              (c) =>
                c.spellId === FIRE_MAGE_SPELL_IDS.SPELLFROST_BOLT &&
                c.success &&
                c.timestampMs > e.timestampMs &&
                c.timestampMs <= reactionWindow,
            )
            if (!acted) {
              errors.push({
                ruleId: 'fire-spellslinger-001',
                timestamp: e.timestamp,
                context:
                  `Spellfrost Teachings hit ${SPELLFROST_TEACHINGS_MAX_STACKS} stacks at ${e.timestamp}` +
                  ` with no Spellfrost Bolt cast within ${SPELLFROST_BOLT_REACTION_MS / 1000}s`,
              })
            }
          }
        }
        return errors
      },
    },
    {
      id: 'fire-spellslinger-002',
      name: 'Spellfrost Bolt Cast With No Stacks',
      severity: 'moderate',
      description: 'Spellfrost Bolt was cast while Spellfrost Teachings had zero stacks.',
      whyItMatters:
        'Spellfrost Bolt deals reduced damage outside the max-stacks window and delays the next stack cycle by consuming a GCD that should be a Fireball.',
      howToFix:
        'Only cast Spellfrost Bolt when Spellfrost Teachings is at maximum stacks. Every other GCD should be Fireball to build stacks as fast as possible.',
      detect(log: ParsedLog): DetectedError[] {
        return log.castEvents
          .filter((e) => e.spellId === FIRE_MAGE_SPELL_IDS.SPELLFROST_BOLT && e.success)
          .filter((e) => getSpellfrostStacksAt(log, e.timestampMs) === 0)
          .map((e) => ({
            ruleId: 'fire-spellslinger-002',
            timestamp: e.timestamp,
            context: `Spellfrost Bolt cast at ${e.timestamp} with zero Spellfrost Teachings stacks active`,
          }))
      },
    },
  ],

  additionalMistakes: [
    'Delaying Spellfrost Bolt after Spellfrost Teachings reaches max stacks, wasting the damage window and stalling the stack cycle.',
    'Casting Spellfrost Bolt with zero stacks, dealing reduced damage and burning a GCD that should be a stack-generating Fireball.',
    'Neglecting Slipstream during movement phases, causing Fireball gaps that slow Spellfrost Teachings stack generation unnecessarily.',
  ],

  spellIds: {
    'Spellfrost Teachings': FIRE_MAGE_SPELL_IDS.SPELLFROST_TEACHINGS,
    'Spellfrost Bolt': FIRE_MAGE_SPELL_IDS.SPELLFROST_BOLT,
    Slipstream: FIRE_MAGE_SPELL_IDS.SLIPSTREAM,
  },
}
