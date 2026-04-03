import type { BaseSpecDefinition } from '../../types'

export const brewmasterMonk: BaseSpecDefinition = {
  specKey: 'monk-brewmaster',
  className: 'Monk',
  specName: 'Brewmaster Monk',
  patchVersion: '11.1',
  supportedHeroTalents: ['master-of-harmony', 'dance-of-chi-ji'],

  rotationSummary:
    'Brewmaster is a tank spec that converts incoming damage into a Stagger pool, which is then cleared by Purifying Brew before it deals lethal damage. ' +
    'Purifying Brew should be used when Stagger is Heavy (red) to clear the damage pool — do not spend charges on Light or Moderate Stagger unnecessarily. ' +
    'Keg Smash is the primary damage and Shuffle uptime ability — use it on cooldown to maintain Shuffle, which reduces Stagger passthrough. ' +
    'Celestial Brew provides a large absorb shield and should be used before predictable burst damage to prevent Stagger from spiking too high.',

  spellIds: {},

  commonMistakes: [
    'Using Purifying Brew on Light or Moderate Stagger rather than saving charges for Heavy Stagger, wasting the cooldown.',
    'Letting Shuffle fall off by not using Keg Smash on cooldown, losing the physical damage reduction from Stagger.',
    'Not using Celestial Brew before anticipated spike damage, missing the shield window and allowing Stagger to reach lethal levels.',
  ],

  rules: [],
}
