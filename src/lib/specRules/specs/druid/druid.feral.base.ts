import type { BaseSpecDefinition } from '../../types'

export const feralDruid: BaseSpecDefinition = {
  specKey: 'druid-feral',
  className: 'Druid',
  specName: 'Feral Druid',
  patchVersion: '11.1',
  supportedHeroTalents: ['druid-of-the-claw', 'wildstalker'],

  rotationSummary:
    'Feral is a melee DPS spec driven by combo point generation and finisher spending, with sustained DoT damage from Rip as the core damage source. ' +
    'Rip uptime on primary targets is the highest DoT priority — refresh it before it expires using Ferocious Bite only when Rip has more than 3 seconds remaining and Sabertooth is talented. ' +
    "Tiger's Fury is the primary damage cooldown and should be used on cooldown to boost all cat form ability damage. " +
    'Ferocious Bite is the combo point finisher and should be cast at 5 combo points — it also extends Rip duration when Sabertooth is active.',

  spellIds: {},

  commonMistakes: [
    'Letting Rip fall off the primary target, losing the largest sustained damage source and wasting combo points spent applying it.',
    'Spending combo points on Ferocious Bite before Rip is applied or near expiry, reducing overall DoT uptime.',
    "Delaying Tiger's Fury past its cooldown, losing its damage amplification across DoTs and direct attacks.",
  ],

  rules: [],
}
