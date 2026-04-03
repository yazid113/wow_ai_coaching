import type { BaseSpecDefinition } from '../../types'

export const mistweaverMonk: BaseSpecDefinition = {
  specKey: 'monk-mistweaver',
  className: 'Monk',
  specName: 'Mistweaver Monk',
  patchVersion: '11.1',
  supportedHeroTalents: ['conduit-of-the-celestials', 'master-of-harmony'],

  rotationSummary:
    'Mistweaver is a melee-range healer that spreads Renewing Mist as a HoT across the group, then amplifies it with Rising Mist and Vivify bounces. ' +
    'Renewing Mist should be used on cooldown to maintain maximum HoT coverage across the group — Vivify bounces to all active Renewing Mist targets. ' +
    'Rising Sun Kick reduces the cooldown of Renewing Mist and applies Rising Mist to extend all active HoTs — use it on cooldown from melee range. ' +
    'Thunder Focus Tea empowers the next spell cast and should be paired with Renewing Mist for a free extra application or Vivify for reduced mana cost during high healing demand.',

  spellIds: {},

  commonMistakes: [
    'Letting Renewing Mist sit off cooldown, reducing active HoT count and Vivify bounce targets across the group.',
    'Standing at range and not using Rising Sun Kick, losing HoT extension from Rising Mist and Renewing Mist cooldown reduction.',
    'Using Thunder Focus Tea on low-priority spells rather than pairing it with Renewing Mist or Vivify during heavy damage.',
  ],

  rules: [],
}
