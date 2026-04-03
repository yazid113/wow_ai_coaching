import type { BaseSpecDefinition } from '../../types'

export const survivalHunter: BaseSpecDefinition = {
  specKey: 'hunter-survival',
  className: 'Hunter',
  specName: 'Survival Hunter',
  patchVersion: '11.1',
  supportedHeroTalents: ['pack-leader', 'dark-ranger'],

  rotationSummary:
    'Survival is a melee-range DPS spec that blends physical attacks with explosive abilities, centred on Wildfire Bomb as the primary rotational cooldown. ' +
    'Wildfire Bomb should be used on cooldown and never held — it is the largest single damage contributor and generates Focus. ' +
    'Flanking Strike and Raptor Strike serve as the core melee combo for Focus spending and Mongoose Bite stacking during Coordinated Assault. ' +
    'Coordinated Assault is the major burst cooldown and should be aligned with Kill Command charges and maximum Mongoose Fury stacks.',

  spellIds: {},

  commonMistakes: [
    'Holding Wildfire Bomb past its cooldown, losing its damage and Focus generation over the course of a fight.',
    'Entering Coordinated Assault without building Mongoose Fury stacks, reducing the burst value of the cooldown window.',
    'Overcapping Focus between Flanking Strike and Raptor Strike casts, wasting generation from Wildfire Bomb and Kill Command.',
  ],

  rules: [],
}
