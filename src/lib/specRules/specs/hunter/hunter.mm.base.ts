import type { BaseSpecDefinition } from '../../types'

export const marksmanshipHunter: BaseSpecDefinition = {
  specKey: 'hunter-marksmanship',
  className: 'Hunter',
  specName: 'Marksmanship Hunter',
  patchVersion: '11.1',
  supportedHeroTalents: ['dark-ranger', 'sentinel'],

  rotationSummary:
    'Marksmanship is a ranged DPS spec centred on Aimed Shot as its primary damage ability, requiring cast time outside of Trick Shots and Precise Shots procs. ' +
    'Rapid Fire is the major cooldown and primary Focus generator — use it on cooldown and follow with Aimed Shot to consume Precise Shots charges at reduced cast time. ' +
    'Arcane Shot or Multi-Shot in AoE serve as Focus spenders and Precise Shots consumers when Aimed Shot is on cooldown. ' +
    'Trick Shots makes the next Aimed Shot or Rapid Fire cleave to nearby targets — activate it with Multi-Shot in AoE.',

  spellIds: {},

  commonMistakes: [
    'Wasting Precise Shots charges by casting Aimed Shot at full cast time instead of consuming the proc first.',
    'Letting Rapid Fire sit off cooldown, losing its Focus generation and Precise Shots proc.',
    'Not activating Trick Shots with Multi-Shot before Aimed Shot or Rapid Fire in AoE situations.',
  ],

  rules: [],
}
