import type { BaseSpecDefinition } from '../../types'

export const restorationShaman: BaseSpecDefinition = {
  specKey: 'shaman-restoration',
  className: 'Shaman',
  specName: 'Restoration Shaman',
  patchVersion: '11.1',
  supportedHeroTalents: ['totemic', 'farseer'],

  rotationSummary:
    'Restoration is a HoT and direct heal hybrid that delivers burst AoE healing through Chain Heal and targeted throughput through Healing Wave and Healing Surge. ' +
    'Riptide should be kept on cooldown and applied to injured targets — it provides a HoT, empowers the following Chain Heal, and generates High Tide procs. ' +
    'Healing Rain is the primary AoE ground heal and should be placed under stacked groups for its full duration to maximise efficiency. ' +
    'Healing Stream Totem should be dropped on cooldown as a free passive heal source that requires no GCD investment once placed.',

  spellIds: {},

  commonMistakes: [
    'Letting Riptide sit off cooldown, losing the HoT, Chain Heal empowerment, and High Tide proc generation.',
    'Not placing or repositioning Healing Rain when the group moves, losing significant passive AoE healing efficiency.',
    'Casting Healing Surge instead of Healing Wave when throughput allows, overspending mana unnecessarily.',
  ],

  rules: [],
}
