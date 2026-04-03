import type { WowClass } from './classSelector.interfaces'

export const WARRIOR_GROUP: WowClass[] = [
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
