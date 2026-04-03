import type { BaseSpecDefinition } from '../../types'

export const assassinationRogue: BaseSpecDefinition = {
  specKey: 'rogue-assassination',
  className: 'Rogue',
  specName: 'Assassination Rogue',
  patchVersion: '11.1',
  supportedHeroTalents: ['deathstalker', 'fatebound'],

  rotationSummary:
    'Assassination is a DoT-based melee DPS spec that deals damage primarily through Rupture and Garrote, sustained by Envenom as the combo point spender. ' +
    'Rupture uptime is the highest priority — apply it at 5 combo points and refresh it before expiry to maintain the amplification it provides to all poison damage. ' +
    'Envenom is the primary combo point spender and extends the Envenom buff, which amplifies all poison damage — use it to keep the buff active at all times. ' +
    'Deathmark is the major burst cooldown and should be used with all DoTs already applied to snapshot their damage at maximum power.',

  spellIds: {},

  commonMistakes: [
    'Letting Rupture fall off the primary target, losing poison amplification and the largest sustained damage source.',
    'Spending combo points on Envenom when Rupture is missing or near expiry, deprioritising the most important finisher.',
    'Using Deathmark before all DoTs are applied, losing snapshotted damage amplification for the entire burst window.',
  ],

  rules: [],
}
