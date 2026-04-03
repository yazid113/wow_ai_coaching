import type { WowClass } from './classSelector.interfaces'

export const MAGE_CLASS: WowClass[] = [
  {
    key: 'mage',
    name: 'Mage',
    color: '#3FC7EB',
    iconUrl: 'https://wow.zamimg.com/images/wow/icons/large/classicon_mage.jpg',
    specs: [
      {
        key: 'mage-arcane',
        name: 'Arcane',
        role: 'dps',
        heroTalents: [
          { key: 'sunfury', name: 'Sunfury' },
          { key: 'spellslinger', name: 'Spellslinger' },
        ],
      },
      {
        key: 'mage-fire',
        name: 'Fire',
        role: 'dps',
        heroTalents: [
          { key: 'sunfury', name: 'Sunfury' },
          { key: 'spellslinger', name: 'Spellslinger' },
        ],
      },
      {
        key: 'mage-frost',
        name: 'Frost',
        role: 'dps',
        heroTalents: [
          { key: 'frostfire', name: 'Frostfire' },
          { key: 'spellfrost', name: 'Spellfrost' },
        ],
      },
    ],
  },
]
