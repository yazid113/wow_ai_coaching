import type { WowClass } from './classSelector.interfaces'

export const WARLOCK_CLASS: WowClass[] = [
  {
    key: 'warlock',
    name: 'Warlock',
    color: '#8788EE',
    iconUrl: 'https://wow.zamimg.com/images/wow/icons/large/classicon_warlock.jpg',
    specs: [
      {
        key: 'warlock-affliction',
        name: 'Affliction',
        role: 'dps',
        heroTalents: [
          { key: 'hellcaller', name: 'Hellcaller' },
          { key: 'soul-harvester', name: 'Soul Harvester' },
        ],
      },
      {
        key: 'warlock-demonology',
        name: 'Demonology',
        role: 'dps',
        heroTalents: [
          { key: 'diabolist', name: 'Diabolist' },
          { key: 'soul-harvester', name: 'Soul Harvester' },
        ],
      },
      {
        key: 'warlock-destruction',
        name: 'Destruction',
        role: 'dps',
        heroTalents: [
          { key: 'diabolist', name: 'Diabolist' },
          { key: 'hellcaller', name: 'Hellcaller' },
        ],
      },
    ],
  },
]
