import type { BaseSpecDefinition } from '../../types'

export const outlawRogue: BaseSpecDefinition = {
  specKey: 'rogue-outlaw',
  className: 'Rogue',
  specName: 'Outlaw Rogue',
  patchVersion: '11.1',
  supportedHeroTalents: ['trickster', 'fatebound'],

  rotationSummary:
    'Outlaw is a melee DPS spec built around Roll the Bones buff management and high Blade Flurry AoE cleave. ' +
    'Roll the Bones applies random combat buffs — reroll with fewer than 2 buffs active and maintain the sequence when 2 or more favourable buffs are present. ' +
    'Slice and Dice must be kept active at all times as it increases attack speed significantly and is the highest-priority finisher after the initial application. ' +
    'Between the Eyes is the primary execute-range burst finisher and should be used at 5 combo points during Adrenaline Rush or cooldown windows.',

  spellIds: {},

  commonMistakes: [
    'Letting Slice and Dice fall off, losing the attack speed bonus that drives Energy regeneration and combo point generation.',
    'Not rerolling Roll the Bones when only 1 buff is active, missing the opportunity for higher-value buff combinations.',
    'Overcapping Energy by delaying combo point spenders, wasting passive regeneration during Adrenaline Rush.',
  ],

  rules: [],
}
