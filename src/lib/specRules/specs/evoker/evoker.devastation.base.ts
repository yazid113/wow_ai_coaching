import type { BaseSpecDefinition } from '../../types'

export const devastationEvoker: BaseSpecDefinition = {
  specKey: 'evoker-devastation',
  className: 'Evoker',
  specName: 'Devastation Evoker',
  patchVersion: '11.1',
  supportedHeroTalents: ['scalecommander', 'flameshaper'],

  rotationSummary:
    'Devastation is a ranged DPS spec built around Dragonrage as its primary burst cooldown, during which all Essence abilities are empowered and cost no Essence. ' +
    'Fire Breath and Eternity Surge are the two empowered spells and should be used at maximum empower level outside Dragonrage, and quickly inside to maximise casts during the window. ' +
    'Disintegrate is the primary Essence-spending filler channel and should not be clipped — interrupt only to cast Eternity Surge or Fire Breath if they come off cooldown. ' +
    'Living Flame serves as the low-Essence filler and generates Leaping Flames procs for efficient AoE healing-while-dealing-damage.',

  spellIds: {},

  commonMistakes: [
    'Clipping Disintegrate early to cast non-priority abilities, losing Essence generation from the channel tick.',
    'Empowering Fire Breath or Eternity Surge to maximum level inside Dragonrage instead of releasing quickly to fit more casts in the window.',
    'Overcapping Essence by delaying Disintegrate, wasting passive Essence regeneration between casts.',
  ],

  rules: [],
}
