import type { BaseSpecDefinition, HeroTalentOverlay, ResolvedSpecDefinition } from './types'

/**
 * Merges a BaseSpecDefinition with a HeroTalentOverlay into the single
 * ResolvedSpecDefinition consumed by all downstream code.
 */
export function composeSpec(
  base: BaseSpecDefinition,
  overlay: HeroTalentOverlay,
): ResolvedSpecDefinition {
  const removedSet = new Set(overlay.removedRuleIds)

  return {
    specKey: base.specKey,
    className: base.className,
    specName: base.specName,
    patchVersion: base.patchVersion,
    heroTalentTree: overlay.heroTalentTree,
    displayName: `${base.specName} — ${overlay.displayName}`,
    rotationSummary:
      base.rotationSummary +
      '\n\n' +
      `HERO TALENT — ${overlay.displayName}:\n` +
      overlay.additionalContext,
    rules: [...base.rules.filter((rule) => !removedSet.has(rule.id)), ...overlay.additionalRules],
    commonMistakes: [...base.commonMistakes, ...overlay.additionalMistakes],
    spellIds: { ...base.spellIds, ...overlay.spellIds },
  }
}

/**
 * Returns a ResolvedSpecDefinition from a base spec alone, with no Hero Talent
 * overlay applied. Used when the player has not yet selected a Hero Talent tree.
 */
export function getBaseSpec(base: BaseSpecDefinition): ResolvedSpecDefinition {
  return {
    specKey: base.specKey,
    className: base.className,
    specName: base.specName,
    patchVersion: base.patchVersion,
    displayName: base.specName,
    rotationSummary: base.rotationSummary,
    rules: [...base.rules],
    commonMistakes: [...base.commonMistakes],
    spellIds: { ...base.spellIds },
  }
}

/**
 * Validates that an overlay is structurally compatible with a base spec before
 * composing. Returns all errors found rather than failing on the first.
 */
export function validateOverlayCompatibility(
  base: BaseSpecDefinition,
  overlay: HeroTalentOverlay,
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!base.supportedHeroTalents.includes(overlay.heroTalentTree)) {
    errors.push(
      `Hero talent tree "${overlay.heroTalentTree}" is not in supportedHeroTalents for ${base.specKey}`,
    )
  }

  const baseRuleIds = new Set(base.rules.map((rule) => rule.id))

  for (const removedId of overlay.removedRuleIds) {
    if (!baseRuleIds.has(removedId)) {
      errors.push(`removedRuleId "${removedId}" does not exist in base rules for ${base.specKey}`)
    }
  }

  for (const additionalRule of overlay.additionalRules) {
    if (baseRuleIds.has(additionalRule.id)) {
      errors.push(
        `additionalRule id "${additionalRule.id}" conflicts with an existing base rule in ${base.specKey}`,
      )
    }
  }

  return { valid: errors.length === 0, errors }
}
