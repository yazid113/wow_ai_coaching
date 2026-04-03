import type { BaseSpecDefinition } from '../../types'

export const subtletyRogue: BaseSpecDefinition = {
  specKey: 'rogue-subtlety',
  className: 'Rogue',
  specName: 'Subtlety Rogue',
  patchVersion: '11.1',
  supportedHeroTalents: ['deathstalker', 'trickster'],

  rotationSummary:
    'Subtlety is a burst-oriented melee DPS spec that deals the majority of its damage inside Shadow Dance windows. ' +
    'Symbols of Death should be used on cooldown as it is the primary combo point generator and Shadow Dance enabler — always pair it with the following Shadow Dance cast. ' +
    'Shadowstrike is the core Shadow Dance filler and must be cast inside the dance window where possible, as it deals significantly more damage from stealth. ' +
    'Eviscerate and Rupture are the primary finishers — maintain Rupture on the target for its damage amplification and spend remaining combo points on Eviscerate.',

  spellIds: {},

  commonMistakes: [
    'Delaying Symbols of Death past its cooldown, losing combo point generation and desynchronising it from Shadow Dance.',
    'Letting Rupture fall off the target during Shadow Dance, losing the amplification it applies to all subsequent Shadowstrike damage.',
    'Spending Shadow Dance charges outside of Symbols of Death windows, splitting the two abilities and reducing burst overlap.',
  ],

  rules: [],
}
