import type { WowClass } from './classSelector.interfaces'

export const HUNTER_GROUP: WowClass[] = [
  {
    key: 'demon-hunter',
    name: 'Demon Hunter',
    color: '#A330C9',
    iconUrl: 'https://wow.zamimg.com/images/wow/icons/large/classicon_demonhunter.jpg',
    specs: [
      {
        key: 'demonhunter-havoc',
        name: 'Havoc',
        role: 'dps',
        heroTalents: [
          { key: 'aldrachi-reaver', name: 'Aldrachi Reaver' },
          { key: 'fel-scarred', name: 'Fel-Scarred' },
        ],
      },
      {
        key: 'demonhunter-vengeance',
        name: 'Vengeance',
        role: 'tank',
        heroTalents: [
          { key: 'aldrachi-reaver', name: 'Aldrachi Reaver' },
          { key: 'annihilator', name: 'Annihilator' },
        ],
      },
      {
        key: 'demonhunter-devourer',
        name: 'Devourer',
        role: 'dps',
        heroTalents: [
          { key: 'void-scarred', name: 'Void-Scarred' },
          { key: 'annihilator', name: 'Annihilator' },
        ],
      },
    ],
  },
  {
    key: 'hunter',
    name: 'Hunter',
    color: '#AAD372',
    iconUrl: 'https://wow.zamimg.com/images/wow/icons/large/classicon_hunter.jpg',
    specs: [
      {
        key: 'hunter-beastmastery',
        name: 'Beast Mastery',
        role: 'dps',
        heroTalents: [
          { key: 'pack-leader', name: 'Pack Leader' },
          { key: 'moon-harvester', name: 'Moon Harvester' },
        ],
      },
      {
        key: 'hunter-marksmanship',
        name: 'Marksmanship',
        role: 'dps',
        heroTalents: [
          { key: 'dark-ranger', name: 'Dark Ranger' },
          { key: 'sentinel', name: 'Sentinel' },
        ],
      },
      {
        key: 'hunter-survival',
        name: 'Survival',
        role: 'dps',
        heroTalents: [
          { key: 'pack-leader', name: 'Pack Leader' },
          { key: 'dark-ranger', name: 'Dark Ranger' },
        ],
      },
    ],
  },
  {
    key: 'rogue',
    name: 'Rogue',
    color: '#FFF468',
    iconUrl: 'https://wow.zamimg.com/images/wow/icons/large/classicon_rogue.jpg',
    specs: [
      {
        key: 'rogue-assassination',
        name: 'Assassination',
        role: 'dps',
        heroTalents: [
          { key: 'deathstalker', name: 'Deathstalker' },
          { key: 'fatebound', name: 'Fatebound' },
        ],
      },
      {
        key: 'rogue-outlaw',
        name: 'Outlaw',
        role: 'dps',
        heroTalents: [
          { key: 'trickster', name: 'Trickster' },
          { key: 'fatebound', name: 'Fatebound' },
        ],
      },
      {
        key: 'rogue-subtlety',
        name: 'Subtlety',
        role: 'dps',
        heroTalents: [
          { key: 'deathstalker', name: 'Deathstalker' },
          { key: 'trickster', name: 'Trickster' },
        ],
      },
    ],
  },
]
