import type { BaseSpecDefinition } from '../../types'

export const preservationEvoker: BaseSpecDefinition = {
  specKey: 'evoker-preservation',
  className: 'Evoker',
  specName: 'Preservation Evoker',
  patchVersion: '11.1',
  supportedHeroTalents: ['flameshaper', 'tensors-loupe'],

  rotationSummary:
    'Preservation is a healer that pre-positions Echo on players before damage to amplify the healing those players receive from subsequent casts. ' +
    'Echo should be applied to players who are about to take burst damage — it duplicates the next heal they receive, making target selection critical. ' +
    'Dream Breath is the primary AoE heal and should be empowered to level 3 for maximum coverage, then followed by Spiritbloom for single-target burst. ' +
    'Reversion is the primary HoT and should be kept on the tank and any players taking sustained damage to provide constant passive healing.',

  spellIds: {},

  commonMistakes: [
    'Applying Echo to full-health players rather than those about to take damage, wasting the duplication on low-value heals.',
    'Empowering Dream Breath beyond level 3 or using it at level 1, either wasting cast time or reducing its coverage radius.',
    'Letting Reversion fall off the tank or injured players, losing sustained passive healing during high-damage periods.',
  ],

  rules: [],
}
