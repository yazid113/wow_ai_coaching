import type { BaseSpecDefinition } from '../../types'

export const furyWarrior: BaseSpecDefinition = {
  specKey: 'warrior-fury',
  className: 'Warrior',
  specName: 'Fury Warrior',
  patchVersion: '11.1',
  supportedHeroTalents: ['mountain-thane', 'slayer'],

  rotationSummary:
    'Fury is a dual-wield melee DPS spec that revolves around staying Enraged to amplify all damage dealt. ' +
    'Bloodthirst is the primary Enrage generator and should be used on cooldown — maintaining Enrage uptime is the single most important rotational priority. ' +
    'Rampage is the primary Rage spender and guarantees Enrage — use it to refresh Enrage before it expires rather than waiting to overcap Rage. ' +
    'Raging Blow is only usable while Enraged and should be used to avoid charge overcapping, while Execute replaces Raging Blow below 20% target health.',

  spellIds: {},

  commonMistakes: [
    'Letting Enrage fall off by not casting Bloodthirst or Rampage before the buff expires, losing the core damage amplification.',
    'Overcapping Rage by delaying Rampage, wasting generation from Bloodthirst and auto-attacks.',
    'Overcapping Raging Blow charges during Enrage windows, losing uses of one of the highest damage-per-Rage abilities.',
  ],

  rules: [],
}
