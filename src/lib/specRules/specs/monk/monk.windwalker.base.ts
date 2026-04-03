import type { BaseSpecDefinition } from '../../types'

export const windwalkerMonk: BaseSpecDefinition = {
  specKey: 'monk-windwalker',
  className: 'Monk',
  specName: 'Windwalker Monk',
  patchVersion: '11.1',
  supportedHeroTalents: ['conduit-of-the-celestials', 'master-of-harmony'],

  rotationSummary:
    'Windwalker is a melee DPS spec that spends Chi on Rising Sun Kick and Fists of Fury as its primary damage abilities. ' +
    'Tiger Palm generates Chi and maintains the Press the Advantage buff — cast it as a filler whenever above 2 Chi to avoid Energy overcapping. ' +
    'Rising Sun Kick should be used on cooldown as it is the highest damage-per-Chi ability and triggers Mark of the Crane for Spinning Crane Kick in AoE. ' +
    'Storm, Earth, and Fire splits the monk into three spirits that mirror ability usage — activate it at the start of burst windows and use Rising Sun Kick immediately after.',

  spellIds: {},

  commonMistakes: [
    'Overcapping Chi by not spending on Rising Sun Kick or Fists of Fury, wasting generation from Tiger Palm.',
    'Delaying Rising Sun Kick past its cooldown, losing the highest damage-per-Chi ability and Mark of the Crane stacks in AoE.',
    'Activating Storm, Earth, and Fire without immediately following with Rising Sun Kick, losing the spirit clone burst window.',
  ],

  rules: [],
}
