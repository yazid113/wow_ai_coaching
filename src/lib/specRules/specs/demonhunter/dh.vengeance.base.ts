import type { BaseSpecDefinition } from '../../types'

export const vengeanceDemonHunter: BaseSpecDefinition = {
  specKey: 'demonhunter-vengeance',
  className: 'Demon Hunter',
  specName: 'Vengeance Demon Hunter',
  patchVersion: '11.1',
  supportedHeroTalents: ['aldrachi-reaver', 'annihilator'],

  rotationSummary:
    'Vengeance is a tank spec that converts Soul Fragments into healing and bonus damage. ' +
    'Immolation Aura generates Fury and Soul Fragments passively and should be kept on cooldown at all times. ' +
    'Fel Devastation is the primary defensive and offensive cooldown — use it when Soul Fragments are available to maximise healing absorption and damage output. ' +
    'Annihilator adds Void-themed AoE burst, rewarding fragment spending during its windows for Void Eruption damage. ' +
    "Aldrachi Reaver provides defensive counter-attacks through Reaver's Glaive, earned by consuming Soul Fragments, adding a reactive damage layer on top of the base tank loop.",

  spellIds: {},

  commonMistakes: [
    'Letting Immolation Aura sit off cooldown for extended periods, starving the rotation of Fury and Soul Fragment generation.',
    'Delaying Fel Devastation when Soul Fragments are available, losing the healing and damage amplification from spending fragments during the channel.',
    'Overcapping Pain by not spending on Spirit Bomb or Soul Cleave when fragments are available, wasting resource generation from Immolation Aura.',
  ],

  rules: [],
}
