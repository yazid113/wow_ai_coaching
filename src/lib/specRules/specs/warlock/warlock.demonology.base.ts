import type { BaseSpecDefinition } from '../../types'

export const demonologyWarlock: BaseSpecDefinition = {
  specKey: 'warlock-demonology',
  className: 'Warlock',
  specName: 'Demonology Warlock',
  patchVersion: '11.1',
  supportedHeroTalents: ['diabolist', 'soul-harvester'],

  rotationSummary:
    "Demonology is a pet-heavy ranged DPS spec that summons imps and demons to deal the majority of damage under Demonic Tyrant's empowerment window. " +
    "Hand of Gul'dan should be used at 3–5 Soul Shards to summon Wild Imps — never spend fewer than 3 Shards to avoid inefficient imp counts. " +
    'Call Dreadstalkers and Vilefiend are on fixed cooldowns and should be used on cooldown to maximise summon uptime. ' +
    'Demonic Tyrant is the major cooldown and should be cast when the maximum number of demons are active to extend all current summons and empower their damage.',

  spellIds: {},

  commonMistakes: [
    "Casting Hand of Gul'dan with fewer than 3 Soul Shards, summoning only 1–2 imps instead of 3–5 and losing significant damage.",
    'Using Demonic Tyrant with few active demons, extending a nearly empty army and wasting the empowerment window.',
    "Overcapping Soul Shards at 5 between Hand of Gul'dan uses, wasting passive Shard generation from Shadow Bolt.",
  ],

  rules: [],
}
