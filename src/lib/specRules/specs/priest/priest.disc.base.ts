import type { BaseSpecDefinition } from '../../types'

export const disciplinePriest: BaseSpecDefinition = {
  specKey: 'priest-discipline',
  className: 'Priest',
  specName: 'Discipline Priest',
  patchVersion: '11.1',
  supportedHeroTalents: ['oracle', 'archon'],

  rotationSummary:
    'Discipline is a healer that primarily heals through Atonement, a passive buff that converts a portion of damage dealt into healing on all Atonement-buffed targets. ' +
    'Atonement must be applied to as many players as possible before damage occurs — Power Word: Shield and Renew are the primary Atonement applicators. ' +
    'Penance is the core damage-to-healing ability and should be used on cooldown, directed at enemies to trigger Atonement healing on all buffed targets. ' +
    'Evangelism extends all active Atonement buffs and should be used at peak Atonement count to maximise healing coverage through the burst window.',

  spellIds: {},

  commonMistakes: [
    'Letting Atonement fall off key players before damage windows, reducing the number of targets receiving passive healing.',
    'Holding Evangelism until Atonement buffs have already expired, losing the extension value on active buffs.',
    'Casting Penance on players as a direct heal instead of on enemies to trigger Atonement, significantly reducing healing throughput.',
  ],

  rules: [],
}
