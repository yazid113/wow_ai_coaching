import type { BaseSpecDefinition } from '../../types'

export const destructionWarlock: BaseSpecDefinition = {
  specKey: 'warlock-destruction',
  className: 'Warlock',
  specName: 'Destruction Warlock',
  patchVersion: '11.1',
  supportedHeroTalents: ['diabolist', 'hellcaller'],

  rotationSummary:
    'Destruction is a ranged DPS spec that generates Soul Shards through Incinerate and Conflagrate, spending them on Chaos Bolt as the primary nuke. ' +
    'Immolate must be maintained on all targets as it is the primary Shard generation source and a prerequisite for Conflagrate. ' +
    'Conflagrate has 2 charges and should be used to avoid charge capping — it generates a Soul Shard fragment and applies Backdraft for faster Incinerate casts. ' +
    "Summon Infernal is the major cooldown and should be used on cooldown, pairing it with Chaos Bolt spam while Infernal's passive Shard generation is active.",

  spellIds: {},

  commonMistakes: [
    'Letting Immolate fall off targets, losing the primary Shard generation source and Conflagrate availability.',
    'Overcapping Soul Shards at 5 by not spending on Chaos Bolt, wasting generation from Immolate ticks and Conflagrate.',
    'Letting Conflagrate charges sit at maximum, losing Backdraft uptime and the associated Incinerate cast time reduction.',
  ],

  rules: [],
}
