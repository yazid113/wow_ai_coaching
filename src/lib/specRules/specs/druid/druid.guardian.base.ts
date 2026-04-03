import type { BaseSpecDefinition } from '../../types'

export const guardianDruid: BaseSpecDefinition = {
  specKey: 'druid-guardian',
  className: 'Druid',
  specName: 'Guardian Druid',
  patchVersion: '11.1',
  supportedHeroTalents: ['druid-of-the-claw', 'keeper-of-the-grove'],

  rotationSummary:
    'Guardian is a bear form tank spec that generates Rage through Thrash, Mangle, and Moonfire, spending it on Maul and Ironfur for active mitigation. ' +
    'Ironfur is the primary physical mitigation cooldown — stack it before major physical damage and maintain at least one charge during sustained boss melee. ' +
    'Galactic Guardian procs from Moonfire make the next Moonfire free and generate bonus Rage — consume procs promptly to avoid wasting them. ' +
    'Barkskin and Survival Instincts are emergency defensives and should be saved for high-burst or unavoidable spike damage phases.',

  spellIds: {},

  commonMistakes: [
    'Letting Ironfur drop entirely during sustained physical damage phases, losing the primary armor bonus.',
    'Overcapping Rage by not spending on Maul when above 80 Rage, wasting generation from Mangle and Thrash.',
    'Wasting Galactic Guardian procs by not casting Moonfire immediately after the proc triggers.',
  ],

  rules: [],
}
