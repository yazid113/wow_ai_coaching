import type { BaseSpecDefinition } from '../../types'

export const holyPriest: BaseSpecDefinition = {
  specKey: 'priest-holy',
  className: 'Priest',
  specName: 'Holy Priest',
  patchVersion: '11.1',
  supportedHeroTalents: ['oracle', 'archon'],

  rotationSummary:
    'Holy is a direct healer that generates Holy Word charges through filler casts, spending them on powerful Holy Word abilities for high-efficiency healing. ' +
    'Holy Word: Serenity and Holy Word: Sanctify have short cooldowns reduced by Heal and Prayer of Healing respectively — cast fillers to reduce Holy Word cooldowns as efficiently as possible. ' +
    'Circle of Healing is an instant AoE heal on a short cooldown and should be used on cooldown whenever multiple players are injured. ' +
    'Divine Hymn is the major raid healing cooldown and should be held for high-damage phases where sustained AoE healing is needed.',

  spellIds: {},

  commonMistakes: [
    'Letting Holy Word: Serenity or Sanctify sit off cooldown without spending charges, losing efficient healing throughput.',
    'Not using Circle of Healing on cooldown when players are injured, missing one of the most efficient group heals available.',
    'Casting Flash Heal instead of Heal when time permits, overspending mana for minimal additional healing output.',
  ],

  rules: [],
}
