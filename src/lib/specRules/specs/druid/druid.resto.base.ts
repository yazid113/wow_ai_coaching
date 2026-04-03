import type { BaseSpecDefinition } from '../../types'

export const restorationDruid: BaseSpecDefinition = {
  specKey: 'druid-restoration',
  className: 'Druid',
  specName: 'Restoration Druid',
  patchVersion: '11.1',
  supportedHeroTalents: ['elunes-chosen', 'wildstalker'],

  rotationSummary:
    'Restoration is a HoT-focused healer that maintains rolling heal-over-time effects to sustain the group passively between direct heal casts. ' +
    'Lifebloom should be maintained on the active tank at all times — its expiry provides a large bloom heal and it generates free Clearcast procs. ' +
    'Efflorescence should be placed under the group whenever melee or the raid is stacked, providing passive AoE healing for its full duration. ' +
    'Wild Growth is the primary AoE heal and should be used whenever 4 or more players are injured — Swiftmend must be cast first to trigger Soul of the Forest.',

  spellIds: {},

  commonMistakes: [
    'Letting Lifebloom fall off the tank, losing passive healing, Clearcast generation, and the bloom on expiry.',
    'Not placing or repositioning Efflorescence when the group moves, losing significant passive AoE healing.',
    'Casting Wild Growth without a prior Swiftmend when Soul of the Forest is talented, losing the 150% healing amplification on the HoT.',
  ],

  rules: [],
}
