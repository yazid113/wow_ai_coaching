import type { BaseSpecDefinition } from '../../types'

export const balanceDruid: BaseSpecDefinition = {
  specKey: 'druid-balance',
  className: 'Druid',
  specName: 'Balance Druid',
  patchVersion: '11.1',
  supportedHeroTalents: ['elunes-chosen', 'keeper-of-the-grove'],

  rotationSummary:
    'Balance is a ranged DPS spec that cycles between Solar and Lunar Eclipse states, with each state empowering either Wrath or Starfire respectively. ' +
    'Starsurge is the single-target Astral Power spender and Starfall is the AoE spender — use the correct spender for the target count to avoid wasting Astral Power. ' +
    'Moonfire and Sunfire DoTs must be maintained on all targets as they generate Astral Power and deal significant passive damage. ' +
    'Celestial Alignment or Incarnation: Chosen of Elune is the major burst cooldown and should be used on cooldown with DoTs applied.',

  spellIds: {},

  commonMistakes: [
    'Overcapping Astral Power by not spending on Starsurge or Starfall before generating more from DoTs and Eclipse spells.',
    'Letting Moonfire or Sunfire DoTs fall off targets, losing Astral Power generation and sustained damage.',
    'Using Starsurge in AoE or Starfall in single-target, selecting the wrong spender for the encounter.',
  ],

  rules: [],
}
