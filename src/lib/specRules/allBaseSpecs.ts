import { bloodDeathKnight } from './specs/deathknight/dk.blood.base'
import { frostDeathKnight } from './specs/deathknight/dk.frost.base'
import { unholyDeathKnight } from './specs/deathknight/dk.unholy.base'
import { devourerDemonHunter } from './specs/demonhunter/dh.devourer.base'
import { havocDemonHunter } from './specs/demonhunter/dh.havoc.base'
import { vengeanceDemonHunter } from './specs/demonhunter/dh.vengeance.base'
import { balanceDruid } from './specs/druid/druid.balance.base'
import { feralDruid } from './specs/druid/druid.feral.base'
import { guardianDruid } from './specs/druid/druid.guardian.base'
import { restorationDruid } from './specs/druid/druid.resto.base'
import { augmentationEvoker } from './specs/evoker/evoker.augmentation.base'
import { devastationEvoker } from './specs/evoker/evoker.devastation.base'
import { preservationEvoker } from './specs/evoker/evoker.preservation.base'
import { beastMasteryHunter } from './specs/hunter/hunter.bm.base'
import { marksmanshipHunter } from './specs/hunter/hunter.mm.base'
import { survivalHunter } from './specs/hunter/hunter.surv.base'
import { arcaneMage } from './specs/mage/mage.arcane.base'
import { fireMageBase } from './specs/mage/mage.fire.base'
import { frostMageBase } from './specs/mage/mage.frost.base'
import { brewmasterMonk } from './specs/monk/monk.brewmaster.base'
import { mistweaverMonk } from './specs/monk/monk.mistweaver.base'
import { windwalkerMonk } from './specs/monk/monk.windwalker.base'
import { holyPaladin } from './specs/paladin/paladin.holy.base'
import { protectionPaladin } from './specs/paladin/paladin.prot.base'
import { retributionPaladin } from './specs/paladin/paladin.ret.base'
import { disciplinePriest } from './specs/priest/priest.disc.base'
import { holyPriest } from './specs/priest/priest.holy.base'
import { shadowPriest } from './specs/priest/priest.shadow.base'
import { assassinationRogue } from './specs/rogue/rogue.assassination.base'
import { outlawRogue } from './specs/rogue/rogue.outlaw.base'
import { subtletyRogue } from './specs/rogue/rogue.subtlety.base'
import { elementalShaman } from './specs/shaman/shaman.elemental.base'
import { enhancementShaman } from './specs/shaman/shaman.enhancement.base'
import { restorationShaman } from './specs/shaman/shaman.resto.base'
import { afflictionWarlock } from './specs/warlock/warlock.affliction.base'
import { demonologyWarlock } from './specs/warlock/warlock.demonology.base'
import { destructionWarlock } from './specs/warlock/warlock.destruction.base'
import { armsWarrior } from './specs/warrior/warrior.arms.base'
import { furyWarrior } from './specs/warrior/warrior.fury.base'
import { protectionWarrior } from './specs/warrior/warrior.prot.base'
import type { BaseSpecDefinition } from './types'

export const ALL_BASE_SPECS: BaseSpecDefinition[] = [
  bloodDeathKnight,
  frostDeathKnight,
  unholyDeathKnight,
  devourerDemonHunter,
  havocDemonHunter,
  vengeanceDemonHunter,
  balanceDruid,
  feralDruid,
  guardianDruid,
  restorationDruid,
  augmentationEvoker,
  devastationEvoker,
  preservationEvoker,
  beastMasteryHunter,
  marksmanshipHunter,
  survivalHunter,
  arcaneMage,
  fireMageBase,
  frostMageBase,
  brewmasterMonk,
  mistweaverMonk,
  windwalkerMonk,
  holyPaladin,
  protectionPaladin,
  retributionPaladin,
  disciplinePriest,
  holyPriest,
  shadowPriest,
  assassinationRogue,
  outlawRogue,
  subtletyRogue,
  elementalShaman,
  enhancementShaman,
  restorationShaman,
  afflictionWarlock,
  demonologyWarlock,
  destructionWarlock,
  armsWarrior,
  furyWarrior,
  protectionWarrior,
]
