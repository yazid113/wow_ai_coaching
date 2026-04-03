import type { BaseSpecDefinition } from '../../types'

export const bloodDeathKnight: BaseSpecDefinition = {
  specKey: 'deathknight-blood',
  className: 'Death Knight',
  specName: 'Blood Death Knight',
  patchVersion: '11.1',
  supportedHeroTalents: ['rider-of-the-apocalypse', 'deathbringer'],

  rotationSummary:
    'Blood is a tank spec centred on Death Strike as the primary active mitigation, which heals for a percentage of damage recently taken. ' +
    'Death Strike timing is critical — use it after taking burst damage to maximise the heal, and never let Runic Power overcap between uses. ' +
    'Bone Shield provides a stacking physical damage reduction buff replenished by Blood Boil and Death Strike — maintain stacks above 5 during combat. ' +
    'Dancing Rune Weapon is the major cooldown and doubles the effect of all abilities used during its window — pair it with Death Strike for maximum mitigation.',

  spellIds: {},

  commonMistakes: [
    'Using Death Strike outside of burst damage windows, healing for less than the maximum possible and wasting Runic Power.',
    'Letting Bone Shield stacks fall too low by not using Blood Boil to replenish them during lower-damage periods.',
    'Overcapping Runic Power by delaying Death Strike, wasting generation from rune spending and passive regeneration.',
  ],

  rules: [],
}
