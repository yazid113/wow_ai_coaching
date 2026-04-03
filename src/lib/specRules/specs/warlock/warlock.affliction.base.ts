import type { BaseSpecDefinition } from '../../types'

export const afflictionWarlock: BaseSpecDefinition = {
  specKey: 'warlock-affliction',
  className: 'Warlock',
  specName: 'Affliction Warlock',
  patchVersion: '11.1',
  supportedHeroTalents: ['hellcaller', 'soul-harvester'],

  rotationSummary:
    'Affliction is a DoT-based ranged DPS spec that maintains multiple curses and DoTs across targets, spending Soul Shards on Malefic Rapture as its primary burst ability. ' +
    'Corruption, Agony, and Unstable Affliction must be maintained on all priority targets — Malefic Rapture deals damage multiplied by the number of active DoTs. ' +
    'Drain Soul replaces Malefic Rapture in execute range, gaining bonus damage and Shard generation against targets below 20% health. ' +
    'Summon Darkglare is the major burst cooldown and should be used with all DoTs active on the primary target to maximise the extended DoT window.',

  spellIds: {},

  commonMistakes: [
    'Letting Corruption, Agony, or Unstable Affliction fall off targets, reducing Malefic Rapture damage multiplicatively per missing DoT.',
    'Using Summon Darkglare without all DoTs applied, losing the extended damage window on one or more DoT sources.',
    'Overcapping Soul Shards at 5 by not casting Malefic Rapture, wasting Shard generation from Agony and Drain Soul ticks.',
  ],

  rules: [],
}
