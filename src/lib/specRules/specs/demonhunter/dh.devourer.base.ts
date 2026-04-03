import type { BaseSpecDefinition } from '../../types'

export const devourerDemonHunter: BaseSpecDefinition = {
  specKey: 'demonhunter-devourer',
  className: 'Demon Hunter',
  specName: 'Devourer Demon Hunter',
  patchVersion: '11.1',
  supportedHeroTalents: ['void-scarred', 'annihilator'],

  rotationSummary:
    'Devourer is the new Midnight DPS spec for Demon Hunter, centred on Void Metamorphosis extended by Soul Fragment consumption. ' +
    'Each Soul Fragment consumed during Void Metamorphosis adds duration to the form, making fragment generation and spending the core loop. ' +
    'Collapsing Star is a key rotational ability that generates fragments and deals burst Void damage — use it on cooldown to sustain Void Metamorphosis uptime. ' +
    'Annihilator adds Void Meteor procs triggered by high fragment consumption, rewarding aggressive spending during the metamorphosis window. ' +
    'Void-Scarred enhances sustained melee damage outside cooldowns, providing a strong filler profile when Void Metamorphosis is unavailable.',

  spellIds: {},

  commonMistakes: [
    'Failing to consume Soul Fragments during Void Metamorphosis, cutting the form short and losing potential extension time.',
    'Holding Collapsing Star past its cooldown, reducing total fragment generation and Void Metamorphosis uptime across the fight.',
    'Spending Soul Fragments outside of Void Metamorphosis when the cooldown is nearly ready, reducing the burst value of the metamorphosis window.',
  ],

  rules: [],
}
