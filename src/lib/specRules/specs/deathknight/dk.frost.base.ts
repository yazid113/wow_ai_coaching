import type { BaseSpecDefinition } from '../../types'

export const frostDeathKnight: BaseSpecDefinition = {
  specKey: 'deathknight-frost',
  className: 'Death Knight',
  specName: 'Frost Death Knight',
  patchVersion: '11.1',
  supportedHeroTalents: ['rider-of-the-apocalypse', 'deathbringer'],

  rotationSummary:
    'Frost is a melee DPS spec built around Killing Machine procs that empower Obliterate with critical strike bonuses. ' +
    'Obliterate is the primary Runic Power generator and highest-priority spender during Killing Machine procs — never let a Killing Machine charge expire unused. ' +
    'Frost Strike is the Runic Power spender and should be used to avoid overcapping between Obliterate casts. ' +
    'Pillar of Frost is the major burst cooldown and should be paired with Empower Rune Weapon for maximum Killing Machine proc density.',

  spellIds: {},

  commonMistakes: [
    'Letting Killing Machine procs expire without casting Obliterate, wasting a guaranteed critical strike.',
    'Overcapping Runic Power by delaying Frost Strike, losing resource generated from Obliterate and passive regeneration.',
    'Using Pillar of Frost without Empower Rune Weapon ready, splitting the two cooldowns and reducing their combined burst value.',
  ],

  rules: [],
}
