import type { BaseSpecDefinition } from '../../types'

export const protectionWarrior: BaseSpecDefinition = {
  specKey: 'warrior-protection',
  className: 'Warrior',
  specName: 'Protection Warrior',
  patchVersion: '11.1',
  supportedHeroTalents: ['mountain-thane', 'colossus'],

  rotationSummary:
    'Protection is a tank spec centred on Shield Slam as its primary generator and Ignore Pain as the main active mitigation for magic and physical damage. ' +
    'Shield Slam should be used on cooldown — it is the primary Rage generator and the main source of Shield Block and Ignore Pain resource. ' +
    'Thunder Clap serves as the AoE rotational filler and maintains the damage reduction debuff on all nearby enemies. ' +
    'Shield Block provides physical mitigation by blocking attacks — maintain its uptime during physical-heavy damage phases by spending Rage before overcapping.',

  spellIds: {},

  commonMistakes: [
    'Letting Shield Slam sit off cooldown, starving Rage generation and delaying Ignore Pain and Shield Block uptime.',
    'Overcapping Rage by not spending on Ignore Pain or Shield Block, wasting generation from Shield Slam and Thunder Clap.',
    'Dropping Shield Block uptime during physical damage phases by spending all Rage on Ignore Pain instead of balancing between both.',
  ],

  rules: [],
}
