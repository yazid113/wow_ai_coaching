import type { BaseSpecDefinition } from '../../types'

export const unholyDeathKnight: BaseSpecDefinition = {
  specKey: 'deathknight-unholy',
  className: 'Death Knight',
  specName: 'Unholy Death Knight',
  patchVersion: '11.1',
  supportedHeroTalents: ['rider-of-the-apocalypse', 'san-layn'],

  rotationSummary:
    'Unholy is a melee DPS spec that controls an undead army, with Festering Wound management as the core loop alongside Army of the Dead. ' +
    'Festering Strike applies Festering Wounds, which are detonated by Scourge Strike to generate Runic Corruption procs and deal bonus shadow damage. ' +
    'Apocalypse is the major cooldown and should be used with 4 or more Festering Wounds on the target to summon the maximum number of undead. ' +
    'Dark Transformation empowers the Ghoul and should be used on cooldown, ideally inside Unholy Assault or other burst windows.',

  spellIds: {},

  commonMistakes: [
    'Using Apocalypse with fewer than 4 Festering Wounds, summoning fewer undead and reducing the burst window value.',
    'Letting Dark Transformation sit off cooldown, losing sustained Ghoul damage amplification across the fight.',
    'Overcapping Runic Power by not spending on Death Coil between burst cooldowns, wasting generation from Runic Corruption procs.',
  ],

  rules: [],
}
