import type { BaseSpecDefinition } from '../../types'

export const arcaneMage: BaseSpecDefinition = {
  specKey: 'mage-arcane',
  className: 'Mage',
  specName: 'Arcane Mage',
  patchVersion: '11.1',
  supportedHeroTalents: ['sunfury', 'spellslinger'],

  rotationSummary:
    'Arcane is a burst-focused ranged DPS spec that builds Arcane Charges to 4 through Arcane Blast, then expends them in a high-damage window around Arcane Surge. ' +
    'Arcane Blast builds Arcane Charges and is the primary filler — maintain 4 charges before spending to maximise Arcane Surge damage. ' +
    'Touch of the Magi should be applied immediately before Arcane Surge to snapshot the debuff into the burst window, then detonated at the end of the window. ' +
    'Mana management is critical outside burst windows — use Arcane Barrage to dump charges and partially restore mana before re-entering the charge-building phase.',

  spellIds: {},

  commonMistakes: [
    "Casting Arcane Surge without 4 Arcane Charges, losing a significant portion of the burst window's damage amplification.",
    'Not applying Touch of the Magi before Arcane Surge, missing the debuff detonation value from the entire burst window.',
    'Overcapping mana during the filler phase by not using Arcane Barrage to dump charges and restore mana between burst windows.',
  ],

  rules: [],
}
