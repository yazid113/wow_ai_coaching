import type { BaseSpecDefinition } from '../../types'

export const protectionPaladin: BaseSpecDefinition = {
  specKey: 'paladin-protection',
  className: 'Paladin',
  specName: 'Protection Paladin',
  patchVersion: '11.1',
  supportedHeroTalents: ['herald-of-the-sun', 'lightsmith'],

  rotationSummary:
    'Protection generates Holy Power through Hammer of the Righteous, Judgment, and Blessed Hammer, spending it on Shield of the Righteous for physical damage mitigation. ' +
    "Avenger's Shield is the primary ranged ability and interrupt — cast it on cooldown for Holy Power and damage. " +
    'Word of Glory is available as a self-heal when active mitigation from Shield of the Righteous is not needed. ' +
    'Consecration should be kept active under the tank to benefit from its passive damage reduction bonus.',

  spellIds: {},

  commonMistakes: [
    'Overcapping Holy Power by failing to spend with Shield of the Righteous, reducing physical mitigation uptime.',
    "Letting Avenger's Shield sit off cooldown, losing Holy Power generation and significant damage output.",
    'Dropping Consecration uptime during active combat, losing the passive damage reduction it provides.',
  ],

  rules: [],
}
