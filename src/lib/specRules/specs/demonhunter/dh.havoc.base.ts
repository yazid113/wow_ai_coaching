import type { BaseSpecDefinition } from '../../types'

export const havocDemonHunter: BaseSpecDefinition = {
  specKey: 'demonhunter-havoc',
  className: 'Demon Hunter',
  specName: 'Havoc Demon Hunter',
  patchVersion: '11.1',
  supportedHeroTalents: ['aldrachi-reaver', 'fel-scarred'],

  rotationSummary:
    'Havoc is a melee DPS spec focused on Metamorphosis windows. ' +
    'Fel-Scarred enhances every demon form entry with Demonsurge, rewarding frequent Metamorphosis usage and stacking its bonus damage on re-entry. ' +
    "Aldrachi Reaver revolves around Reaver's Glaive, earned through soul fragment consumption, which transforms Eye Beam into a high-damage finisher. " +
    'Eye Beam and Chaos Strike are core rotational abilities — spend Fury on Chaos Strike to avoid overcapping and use Eye Beam on cooldown to generate Furious Gaze uptime. ' +
    'Pool Fury before Metamorphosis to maximise the burst window.',

  spellIds: {},

  commonMistakes: [
    'Overcapping Fury by not spending Chaos Strike frequently enough between Eye Beam casts.',
    "Delaying Metamorphosis past its cooldown, losing time in demon form and reducing total Demonsurge or Reaver's Glaive proc opportunities.",
    'Using Eye Beam outside of Metamorphosis or Furious Gaze windows when higher-priority abilities are available.',
  ],

  rules: [],
}
