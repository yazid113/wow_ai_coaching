import { composeSpec, getBaseSpec, validateOverlayCompatibility } from './compose'
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
import { fireMageSpellslinger } from './specs/mage/mage.fire.spellslinger'
import { fireMageSunfury } from './specs/mage/mage.fire.sunfury'
import { frostMageBase } from './specs/mage/mage.frost.base'
import { frostMageFrostfire } from './specs/mage/mage.frost.frostfire'
import { frostMageSpellfrost } from './specs/mage/mage.frost.spellfrost'
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
import { demonologyWarlockDiabolist } from './specs/warlock/warlock.demonology.diabolist'
import { destructionWarlock } from './specs/warlock/warlock.destruction.base'
import { armsWarrior } from './specs/warrior/warrior.arms.base'
import { furyWarrior } from './specs/warrior/warrior.fury.base'
import { protectionWarrior } from './specs/warrior/warrior.prot.base'
import type {
  BaseSpecDefinition,
  HeroTalentOverlay,
  HeroTalentTree,
  ResolvedSpecDefinition,
} from './types'

// ─── Internal Registries ─────────────────────────────────────────────────────

const BASE_REGISTRY: Record<string, BaseSpecDefinition> = {
  // Mage
  [arcaneMage.specKey]: arcaneMage,
  [fireMageBase.specKey]: fireMageBase,
  [frostMageBase.specKey]: frostMageBase,
  // Paladin
  [retributionPaladin.specKey]: retributionPaladin,
  [protectionPaladin.specKey]: protectionPaladin,
  [holyPaladin.specKey]: holyPaladin,
  // Hunter
  [beastMasteryHunter.specKey]: beastMasteryHunter,
  [marksmanshipHunter.specKey]: marksmanshipHunter,
  [survivalHunter.specKey]: survivalHunter,
  // Warrior
  [furyWarrior.specKey]: furyWarrior,
  [armsWarrior.specKey]: armsWarrior,
  [protectionWarrior.specKey]: protectionWarrior,
  // Death Knight
  [unholyDeathKnight.specKey]: unholyDeathKnight,
  [bloodDeathKnight.specKey]: bloodDeathKnight,
  [frostDeathKnight.specKey]: frostDeathKnight,
  // Druid
  [balanceDruid.specKey]: balanceDruid,
  [feralDruid.specKey]: feralDruid,
  [guardianDruid.specKey]: guardianDruid,
  [restorationDruid.specKey]: restorationDruid,
  // Rogue
  [assassinationRogue.specKey]: assassinationRogue,
  [outlawRogue.specKey]: outlawRogue,
  [subtletyRogue.specKey]: subtletyRogue,
  // Priest
  [shadowPriest.specKey]: shadowPriest,
  [disciplinePriest.specKey]: disciplinePriest,
  [holyPriest.specKey]: holyPriest,
  // Shaman
  [elementalShaman.specKey]: elementalShaman,
  [enhancementShaman.specKey]: enhancementShaman,
  [restorationShaman.specKey]: restorationShaman,
  // Monk
  [windwalkerMonk.specKey]: windwalkerMonk,
  [brewmasterMonk.specKey]: brewmasterMonk,
  [mistweaverMonk.specKey]: mistweaverMonk,
  // Demon Hunter
  [havocDemonHunter.specKey]: havocDemonHunter,
  [vengeanceDemonHunter.specKey]: vengeanceDemonHunter,
  [devourerDemonHunter.specKey]: devourerDemonHunter,
  // Evoker
  [devastationEvoker.specKey]: devastationEvoker,
  [augmentationEvoker.specKey]: augmentationEvoker,
  [preservationEvoker.specKey]: preservationEvoker,
  // Warlock
  [afflictionWarlock.specKey]: afflictionWarlock,
  [destructionWarlock.specKey]: destructionWarlock,
  [demonologyWarlock.specKey]: demonologyWarlock,
}

const OVERLAY_REGISTRY: Record<string, HeroTalentOverlay> = {
  [`${fireMageBase.specKey}:${fireMageSunfury.heroTalentTree}`]: fireMageSunfury,
  [`${fireMageBase.specKey}:${fireMageSpellslinger.heroTalentTree}`]: fireMageSpellslinger,
  [`${frostMageBase.specKey}:${frostMageFrostfire.heroTalentTree}`]: frostMageFrostfire,
  [`${frostMageBase.specKey}:${frostMageSpellfrost.heroTalentTree}`]: frostMageSpellfrost,
  [`${demonologyWarlock.specKey}:${demonologyWarlockDiabolist.heroTalentTree}`]:
    demonologyWarlockDiabolist,
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the fully resolved spec definition for a given spec and optional
 * Hero Talent tree. Returns null if the spec or overlay is not registered.
 */
export function getResolvedSpec(
  specKey: string,
  heroTalentTree?: HeroTalentTree,
): ResolvedSpecDefinition | null {
  const base = BASE_REGISTRY[specKey]
  if (!base) return null

  if (!heroTalentTree) return getBaseSpec(base)

  const overlay = OVERLAY_REGISTRY[`${specKey}:${heroTalentTree}`]
  if (!overlay) return getBaseSpec(base)

  const { valid } = validateOverlayCompatibility(base, overlay)
  if (!valid) return null

  return composeSpec(base, overlay)
}

/**
 * Returns a flat list of all registered specs with their supported Hero Talent
 * trees. Consumed by the ClassSelector UI to build the spec/tree dropdowns.
 */
export function getSupportedSpecs(): Array<{
  specKey: string
  className: string
  specName: string
  heroTalents: Array<{ tree: HeroTalentTree; displayName: string }>
}> {
  return Object.values(BASE_REGISTRY).map((base) => ({
    specKey: base.specKey,
    className: base.className,
    specName: base.specName,
    heroTalents: base.supportedHeroTalents.flatMap((tree) => {
      const overlay = OVERLAY_REGISTRY[`${base.specKey}:${tree}`]
      return overlay ? [{ tree, displayName: overlay.displayName }] : []
    }),
  }))
}

/** Returns true if a spec with the given key is registered. */
export function isSpecSupported(specKey: string): boolean {
  return specKey in BASE_REGISTRY
}

/** Returns true if the given Hero Talent tree is registered for the given spec. */
export function isHeroTalentSupported(specKey: string, tree: HeroTalentTree): boolean {
  return `${specKey}:${tree}` in OVERLAY_REGISTRY
}

// ─── Type Re-exports ──────────────────────────────────────────────────────────

export type {
  BaseSpecDefinition,
  BuffEvent,
  CastEvent,
  DetectedError,
  HeroTalentOverlay,
  HeroTalentTree,
  ParsedLog,
  ResolvedSpecDefinition,
  ResourceEvent,
  Severity,
  SpecRule,
} from './types'
