import type { BaseSpecDefinition } from '../../types'

export const elementalShaman: BaseSpecDefinition = {
  specKey: 'shaman-elemental',
  className: 'Shaman',
  specName: 'Elemental Shaman',
  patchVersion: '11.1',
  supportedHeroTalents: ['stormbringer', 'farseer'],

  rotationSummary:
    'Elemental is a ranged DPS spec that generates Maelstrom through Lightning Bolt and Lava Burst, spending it on Earth Shock or Earthquake in AoE. ' +
    'Flame Shock must be active on the target before casting Lava Burst — Lava Burst always critically strikes against a Flame Shocked target and generates increased Maelstrom. ' +
    'Stormkeeper empowers the next two Lightning Bolts to be instant cast and deal maximum damage — use it on cooldown and consume both charges immediately. ' +
    'Ascendance or Liquid Magma Totem is the major burst cooldown and should be aligned with Stormkeeper and maximum Maelstrom for peak burst output.',

  spellIds: {},

  commonMistakes: [
    'Casting Lava Burst without Flame Shock active on the target, losing the guaranteed critical strike and reduced Maelstrom generation.',
    'Overcapping Maelstrom by delaying Earth Shock or Earthquake, wasting generation from Lava Burst and Lightning Bolt.',
    'Not consuming Stormkeeper charges immediately after casting, letting the buff expire or delaying the empowered Lightning Bolts.',
  ],

  rules: [],
}
