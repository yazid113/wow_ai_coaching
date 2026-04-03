import type { BaseSpecDefinition } from '../../types'

export const shadowPriest: BaseSpecDefinition = {
  specKey: 'priest-shadow',
  className: 'Priest',
  specName: 'Shadow Priest',
  patchVersion: '11.1',
  supportedHeroTalents: ['voidweaver', 'archon'],

  rotationSummary:
    'Shadow is an Insanity-based ranged DPS spec that maintains DoTs and spends Insanity on Devouring Plague as its primary damage ability. ' +
    'Void Bolt is available inside Voidform and must be used on cooldown to extend Voidform duration and generate Insanity. ' +
    'Mind Blast charges should be consumed regularly to generate Insanity and avoid capping — do not let charges sit at maximum. ' +
    'Devouring Plague is the primary Insanity spender and applies a powerful DoT — apply it before spending Insanity on other abilities.',

  spellIds: {},

  commonMistakes: [
    'Overcapping Insanity by delaying Devouring Plague casts, wasting generation from Mind Blast and DoT ticks.',
    'Letting Mind Blast sit at maximum charges, losing passive charge regeneration time.',
    'Letting Vampiric Touch or Shadow Word: Pain fall off targets, losing Insanity generation and sustained background damage.',
  ],

  rules: [],
}
