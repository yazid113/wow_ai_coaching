import type { WowClass } from './classSelector.interfaces'

export const HEALER_GROUP: WowClass[] = [
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
]
