import type { BaseSpecDefinition } from '../../types'

export const armsWarrior: BaseSpecDefinition = {
  specKey: 'warrior-arms',
  className: 'Warrior',
  specName: 'Arms Warrior',
  patchVersion: '11.1',
  supportedHeroTalents: ['colossus', 'slayer'],

  rotationSummary:
    'Arms is a two-handed melee DPS spec that builds Rage through auto-attacks and abilities, spending it on Mortal Strike and Overpower. ' +
    'Colossus Smash applies a 30% armor reduction debuff — all other Rage spenders should be used inside this window to maximise their damage output. ' +
    'Overpower procs from auto-attacks and should be consumed promptly as it costs no Rage and generates a free Rage proc. ' +
    'Execute during the sub-20% execute phase becomes the highest-priority Rage spender and largely replaces the normal rotation.',

  spellIds: {},

  commonMistakes: [
    'Spending Rage outside of the Colossus Smash window on high-cost abilities like Mortal Strike, losing significant damage amplification.',
    'Letting Overpower procs expire without casting, wasting free Rage generation and a high-priority filler.',
    'Overcapping Rage between Mortal Strike casts, particularly during Colossus Smash windows when spending rate is highest.',
  ],

  rules: [],
}
