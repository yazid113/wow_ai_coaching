import type { BaseSpecDefinition } from '../../types'

export const beastMasteryHunter: BaseSpecDefinition = {
  specKey: 'hunter-beastmastery',
  className: 'Hunter',
  specName: 'Beast Mastery Hunter',
  patchVersion: '11.1',
  supportedHeroTalents: ['pack-leader', 'moon-harvester'],

  rotationSummary:
    "Beast Mastery is a ranged DPS spec where pets deal the majority of damage, directed by the hunter's ability usage. " +
    'Barbed Shot maintains the Frenzy buff on the primary pet — keep it at 3 stacks and refresh before it expires to sustain the damage bonus. ' +
    'Kill Command is the primary Focus spender and should be used on cooldown to maximise pet attack frequency. ' +
    'Bestial Wrath is the major cooldown, amplifying all pet damage and should be aligned with Barbed Shot stacks at 3.',

  spellIds: {},

  commonMistakes: [
    'Letting Frenzy stacks drop off the pet by not refreshing Barbed Shot before expiry, losing sustained pet damage.',
    'Overcapping Focus by not spending on Kill Command frequently enough between Barbed Shot casts.',
    'Delaying Bestial Wrath past its cooldown or using it without 3 Frenzy stacks, losing burst amplification.',
  ],

  rules: [],
}
