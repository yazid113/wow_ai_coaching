import type { BaseSpecDefinition } from '../../types'

export const enhancementShaman: BaseSpecDefinition = {
  specKey: 'shaman-enhancement',
  className: 'Shaman',
  specName: 'Enhancement Shaman',
  patchVersion: '11.1',
  supportedHeroTalents: ['totemic', 'stormbringer'],

  rotationSummary:
    'Enhancement is a melee DPS spec that builds Maelstrom Weapon stacks through physical attacks, consuming them to cast instant empowered spells. ' +
    'Maelstrom Weapon stacks should be spent at 5 or more charges on Lightning Bolt or Chain Lightning — never overcap at 10 stacks. ' +
    'Stormstrike is the primary physical ability and must be used on cooldown as it is the fastest Maelstrom Weapon stack generator. ' +
    'Feral Spirit is the major burst cooldown and should be used on cooldown to benefit from its auto-attack speed bonus and Maelstrom Weapon acceleration.',

  spellIds: {},

  commonMistakes: [
    'Overcapping Maelstrom Weapon at 10 stacks, wasting generation from Stormstrike and auto-attacks.',
    'Spending Maelstrom Weapon stacks at 1–4 charges instead of waiting for 5+, reducing the damage per Lightning Bolt cast.',
    'Letting Stormstrike sit off cooldown, losing the primary stack generator and significant physical damage output.',
  ],

  rules: [],
}
