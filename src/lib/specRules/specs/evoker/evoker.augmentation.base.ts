import type { BaseSpecDefinition } from '../../types'

export const augmentationEvoker: BaseSpecDefinition = {
  specKey: 'evoker-augmentation',
  className: 'Evoker',
  specName: 'Augmentation Evoker',
  patchVersion: '11.1',
  supportedHeroTalents: ['scalecommander', 'tensors-loupe'],

  rotationSummary:
    'Augmentation is a support DPS spec whose primary role is amplifying up to 5 allies through Ebon Might and layered buffs. ' +
    'Ebon Might must be maintained at all times on the top 5 DPS players — it is the core buff delivery mechanism and its uptime directly scales all augmentation value. ' +
    'Prescience should be applied to the two highest DPS players before cooldowns for its critical strike buff, refreshing it before expiry. ' +
    'Breath of Eons is the major cooldown and should be used on cooldown while Ebon Might is active on all 5 targets to maximise the amplification window.',

  spellIds: {},

  commonMistakes: [
    'Letting Ebon Might fall off any of the top 5 players, losing the core buff and reducing all augmentation output.',
    'Using Breath of Eons without Ebon Might active on all 5 targets, losing the amplification the ability provides through the buff.',
    'Delaying Prescience applications until after players have used their cooldowns, missing the critical strike buff on their highest-damage abilities.',
  ],

  rules: [],
}
