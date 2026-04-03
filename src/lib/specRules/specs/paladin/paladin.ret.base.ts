import type { BaseSpecDefinition } from '../../types'

export const retributionPaladin: BaseSpecDefinition = {
  specKey: 'paladin-retribution',
  className: 'Paladin',
  specName: 'Retribution Paladin',
  patchVersion: '11.1',
  supportedHeroTalents: ['herald-of-the-sun', 'lightsmith'],

  rotationSummary:
    "Retribution generates Holy Power through Blade of Justice, Judgment, and Crusader Strike, then spends it on Templar's Verdict or Divine Storm in AoE. " +
    'Wake of Ashes is the primary burst generator, providing 5 Holy Power and activating Radiant Glory for an empowered window. ' +
    'Herald of the Sun adds Dawnlight, rewarding Holy Power spending with stacking radiant damage. ' +
    'Lightsmith provides Sacred Weapon uptime, amplifying spender damage when active.',

  spellIds: {},

  commonMistakes: [
    'Overcapping Holy Power by delaying spenders, wasting generation from Blade of Justice and Crusader Strike.',
    'Holding Wake of Ashes past its cooldown rather than using it on cooldown as the primary burst generator.',
    "Casting Divine Storm in single-target or Templar's Verdict in AoE, selecting the wrong spender for the target count.",
  ],

  rules: [],
}
