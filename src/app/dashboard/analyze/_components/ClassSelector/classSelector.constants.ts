import type { WowClass } from './classSelector.interfaces'

export const CLASS_COLORS: Record<string, string> = {
  'death-knight': '#C41E3A',
  'demon-hunter': '#A330C9',
  druid: '#FF7C0A',
  evoker: '#33937F',
  hunter: '#AAD372',
  mage: '#3FC7EB',
  monk: '#00FF98',
  paladin: '#F48CBA',
  priest: '#FFFFFF',
  rogue: '#FFF468',
  shaman: '#0070DD',
  warlock: '#8788EE',
  warrior: '#C69B3A',
}

export const WOW_CLASSES: WowClass[] = [
  {
    key: 'death-knight',
    name: 'Death Knight',
    color: '#C41E3A',
    iconUrl: 'https://wow.zamimg.com/images/wow/icons/large/classicon_deathknight.jpg',
    specs: [
      {
        key: 'deathknight-blood',
        name: 'Blood',
        role: 'tank',
        heroTalents: [
          { key: 'rider-of-the-apocalypse', name: 'Rider of the Apocalypse' },
          { key: 'deathbringer', name: 'Deathbringer' },
        ],
      },
      {
        key: 'deathknight-frost',
        name: 'Frost',
        role: 'dps',
        heroTalents: [
          { key: 'rider-of-the-apocalypse', name: 'Rider of the Apocalypse' },
          { key: 'deathbringer', name: 'Deathbringer' },
        ],
      },
      {
        key: 'deathknight-unholy',
        name: 'Unholy',
        role: 'dps',
        heroTalents: [
          { key: 'rider-of-the-apocalypse', name: 'Rider of the Apocalypse' },
          { key: 'san-layn', name: "San'layn" },
        ],
      },
    ],
  },
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
    key: 'druid',
    name: 'Druid',
    color: '#FF7C0A',
    iconUrl: 'https://wow.zamimg.com/images/wow/icons/large/classicon_druid.jpg',
    specs: [
      {
        key: 'druid-balance',
        name: 'Balance',
        role: 'dps',
        heroTalents: [
          { key: 'elunes-chosen', name: "Elune's Chosen" },
          { key: 'keeper-of-the-grove', name: 'Keeper of the Grove' },
        ],
      },
      {
        key: 'druid-feral',
        name: 'Feral',
        role: 'dps',
        heroTalents: [
          { key: 'druid-of-the-claw', name: 'Druid of the Claw' },
          { key: 'wildstalker', name: 'Wildstalker' },
        ],
      },
      {
        key: 'druid-guardian',
        name: 'Guardian',
        role: 'tank',
        heroTalents: [
          { key: 'druid-of-the-claw', name: 'Druid of the Claw' },
          { key: 'keeper-of-the-grove', name: 'Keeper of the Grove' },
        ],
      },
      {
        key: 'druid-restoration',
        name: 'Restoration',
        role: 'healer',
        heroTalents: [
          { key: 'elunes-chosen', name: "Elune's Chosen" },
          { key: 'wildstalker', name: 'Wildstalker' },
        ],
      },
    ],
  },
  {
    key: 'evoker',
    name: 'Evoker',
    color: '#33937F',
    iconUrl: 'https://wow.zamimg.com/images/wow/icons/large/classicon_evoker.jpg',
    specs: [
      {
        key: 'evoker-devastation',
        name: 'Devastation',
        role: 'dps',
        heroTalents: [
          { key: 'scalecommander', name: 'Scalecommander' },
          { key: 'flameshaper', name: 'Flameshaper' },
        ],
      },
      {
        key: 'evoker-augmentation',
        name: 'Augmentation',
        role: 'dps',
        heroTalents: [
          { key: 'scalecommander', name: 'Scalecommander' },
          { key: 'tensors-loupe', name: "Tensor's Loupe" },
        ],
      },
      {
        key: 'evoker-preservation',
        name: 'Preservation',
        role: 'healer',
        heroTalents: [
          { key: 'flameshaper', name: 'Flameshaper' },
          { key: 'tensors-loupe', name: "Tensor's Loupe" },
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
  {
    key: 'monk',
    name: 'Monk',
    color: '#00FF98',
    iconUrl: 'https://wow.zamimg.com/images/wow/icons/large/classicon_monk.jpg',
    specs: [
      {
        key: 'monk-brewmaster',
        name: 'Brewmaster',
        role: 'tank',
        heroTalents: [
          { key: 'master-of-harmony', name: 'Master of Harmony' },
          { key: 'dance-of-chi-ji', name: 'Dance of Chi-Ji' },
        ],
      },
      {
        key: 'monk-mistweaver',
        name: 'Mistweaver',
        role: 'healer',
        heroTalents: [
          { key: 'conduit-of-the-celestials', name: 'Conduit of the Celestials' },
          { key: 'master-of-harmony', name: 'Master of Harmony' },
        ],
      },
      {
        key: 'monk-windwalker',
        name: 'Windwalker',
        role: 'dps',
        heroTalents: [
          { key: 'conduit-of-the-celestials', name: 'Conduit of the Celestials' },
          { key: 'master-of-harmony', name: 'Master of Harmony' },
        ],
      },
    ],
  },
  {
    key: 'paladin',
    name: 'Paladin',
    color: '#F48CBA',
    iconUrl: 'https://wow.zamimg.com/images/wow/icons/large/classicon_paladin.jpg',
    specs: [
      {
        key: 'paladin-holy',
        name: 'Holy',
        role: 'healer',
        heroTalents: [
          { key: 'herald-of-the-sun', name: 'Herald of the Sun' },
          { key: 'lightsmith', name: 'Lightsmith' },
        ],
      },
      {
        key: 'paladin-protection',
        name: 'Protection',
        role: 'tank',
        heroTalents: [
          { key: 'herald-of-the-sun', name: 'Herald of the Sun' },
          { key: 'lightsmith', name: 'Lightsmith' },
        ],
      },
      {
        key: 'paladin-retribution',
        name: 'Retribution',
        role: 'dps',
        heroTalents: [
          { key: 'herald-of-the-sun', name: 'Herald of the Sun' },
          { key: 'lightsmith', name: 'Lightsmith' },
        ],
      },
    ],
  },
  {
    key: 'priest',
    name: 'Priest',
    color: '#FFFFFF',
    iconUrl: 'https://wow.zamimg.com/images/wow/icons/large/classicon_priest.jpg',
    specs: [
      {
        key: 'priest-discipline',
        name: 'Discipline',
        role: 'healer',
        heroTalents: [
          { key: 'oracle', name: 'Oracle' },
          { key: 'archon', name: 'Archon' },
        ],
      },
      {
        key: 'priest-holy',
        name: 'Holy',
        role: 'healer',
        heroTalents: [
          { key: 'oracle', name: 'Oracle' },
          { key: 'archon', name: 'Archon' },
        ],
      },
      {
        key: 'priest-shadow',
        name: 'Shadow',
        role: 'dps',
        heroTalents: [
          { key: 'voidweaver', name: 'Voidweaver' },
          { key: 'archon', name: 'Archon' },
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
  {
    key: 'shaman',
    name: 'Shaman',
    color: '#0070DD',
    iconUrl: 'https://wow.zamimg.com/images/wow/icons/large/classicon_shaman.jpg',
    specs: [
      {
        key: 'shaman-elemental',
        name: 'Elemental',
        role: 'dps',
        heroTalents: [
          { key: 'stormbringer', name: 'Stormbringer' },
          { key: 'farseer', name: 'Farseer' },
        ],
      },
      {
        key: 'shaman-enhancement',
        name: 'Enhancement',
        role: 'dps',
        heroTalents: [
          { key: 'totemic', name: 'Totemic' },
          { key: 'stormbringer', name: 'Stormbringer' },
        ],
      },
      {
        key: 'shaman-restoration',
        name: 'Restoration',
        role: 'healer',
        heroTalents: [
          { key: 'totemic', name: 'Totemic' },
          { key: 'farseer', name: 'Farseer' },
        ],
      },
    ],
  },
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
  {
    key: 'warrior',
    name: 'Warrior',
    color: '#C69B3A',
    iconUrl: 'https://wow.zamimg.com/images/wow/icons/large/classicon_warrior.jpg',
    specs: [
      {
        key: 'warrior-arms',
        name: 'Arms',
        role: 'dps',
        heroTalents: [
          { key: 'colossus', name: 'Colossus' },
          { key: 'slayer', name: 'Slayer' },
        ],
      },
      {
        key: 'warrior-fury',
        name: 'Fury',
        role: 'dps',
        heroTalents: [
          { key: 'mountain-thane', name: 'Mountain Thane' },
          { key: 'slayer', name: 'Slayer' },
        ],
      },
      {
        key: 'warrior-protection',
        name: 'Protection',
        role: 'tank',
        heroTalents: [
          { key: 'mountain-thane', name: 'Mountain Thane' },
          { key: 'colossus', name: 'Colossus' },
        ],
      },
    ],
  },
]
