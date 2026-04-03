import type { AplParseResult } from './apl.types'
import { parseAplContent } from './aplLineParser'

// ─── Error Class ──────────────────────────────────────────────────────────────

export class FetchAplError extends Error {
  specKey: string
  status?: number

  constructor(specKey: string, message: string, status?: number) {
    super(message)
    this.name = 'FetchAplError'
    this.specKey = specKey
    if (status !== undefined) this.status = status
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SIMC_RAW_BASE = 'https://raw.githubusercontent.com/simulationcraft/simc/midnight'

// Branch: midnight
// 31 specs with APL files in MID1 (listed below).
// Each spec uses the base file, which covers all hero talent trees.
// Hero-talent-specific variants exist in the repo for detailed analysis
// (future enhancement).
// Missing: healer specs, some tank variants.
// patchVersion stored in spec_rotations serves as the audit trail for which
// tier a given sync was sourced from.
const APL_PATHS: Record<string, string> = {
  'mage-fire': '/profiles/MID1/MID1_Mage_Fire.simc',
  'mage-frost': '/profiles/MID1/MID1_Mage_Frost.simc',
  'mage-arcane': '/profiles/MID1/MID1_Mage_Arcane.simc',

  'paladin-retribution': '/profiles/MID1/MID1_Paladin_Retribution.simc',
  'paladin-protection': '/profiles/MID1/MID1_Paladin_Protection.simc',

  'hunter-beastmastery': '/profiles/MID1/MID1_Hunter_Beast_Mastery.simc',
  'hunter-marksmanship': '/profiles/MID1/MID1_Hunter_Marksmanship.simc',
  'hunter-survival': '/profiles/MID1/MID1_Hunter_Survival.simc',

  'warrior-fury': '/profiles/MID1/MID1_Warrior_Fury.simc',
  'warrior-arms': '/profiles/MID1/MID1_Warrior_Arms.simc',
  'warrior-protection': '/profiles/MID1/MID1_Warrior_Protection.simc',

  'deathknight-unholy': '/profiles/MID1/MID1_Death_Knight_Unholy.simc',
  'deathknight-blood': '/profiles/MID1/MID1_Death_Knight_Blood.simc',
  'deathknight-frost': '/profiles/MID1/MID1_Death_Knight_Frost.simc',

  'druid-feral': '/profiles/MID1/MID1_Druid_Feral.simc',
  'druid-guardian': '/profiles/MID1/MID1_Druid_Guardian.simc',

  'rogue-assassination': '/profiles/MID1/MID1_Rogue_Assassination.simc',
  'rogue-outlaw': '/profiles/MID1/MID1_Rogue_Outlaw.simc',
  'rogue-subtlety': '/profiles/MID1/MID1_Rogue_Subtlety.simc',

  'priest-shadow': '/profiles/MID1/MID1_Priest_Shadow.simc',

  'shaman-elemental': '/profiles/MID1/MID1_Shaman_Elemental.simc',
  'shaman-enhancement': '/profiles/MID1/MID1_Shaman_Enhancement.simc',

  'monk-windwalker': '/profiles/MID1/MID1_Monk_Windwalker.simc',
  'monk-brewmaster': '/profiles/MID1/MID1_Monk_Brewmaster.simc',

  'demonhunter-havoc': '/profiles/MID1/MID1_Demon_Hunter_Havoc.simc',
  'demonhunter-vengeance': '/profiles/MID1/MID1_Demon_Hunter_Vengeance.simc',
  'demonhunter-devourer': '/profiles/MID1/MID1_Demon_Hunter_Devourer.simc',

  'evoker-devastation': '/profiles/MID1/MID1_Evoker_Devastation.simc',

  'warlock-affliction': '/profiles/MID1/MID1_Warlock_Affliction.simc',
  'warlock-destruction': '/profiles/MID1/MID1_Warlock_Destruction.simc',
  'warlock-demonology': '/profiles/MID1/MID1_Warlock_Demonology.simc',
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches the raw .simc APL file content for a given spec from the
 * SimulationCraft GitHub repository.
 *
 * Throws FetchAplError if the specKey is not in APL_PATHS or if the
 * HTTP request fails.
 */
export async function fetchAplContent(specKey: string): Promise<string> {
  const path = APL_PATHS[specKey]
  if (path === undefined) {
    throw new FetchAplError(specKey, `No APL path registered for spec "${specKey}"`)
  }

  const url = `${SIMC_RAW_BASE}${path}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new FetchAplError(
      specKey,
      `Failed to fetch APL for "${specKey}": ${response.status} ${response.statusText}`,
      response.status,
    )
  }

  return response.text()
}

/**
 * Fetches and parses the SimulationCraft APL for a given spec.
 * Returns an AplParseResult with success false if the fetch fails —
 * callers do not need to handle FetchAplError directly.
 */
export async function fetchAndParseApl(
  specKey: string,
  patchVersion: string,
  heroTalentTree?: string,
): Promise<AplParseResult> {
  const path = APL_PATHS[specKey]
  const sourceUrl = path !== undefined ? `${SIMC_RAW_BASE}${path}` : `unknown:${specKey}`

  let rawContent: string
  try {
    rawContent = await fetchAplContent(specKey)
  } catch (err) {
    const message = err instanceof FetchAplError ? err.message : String(err)
    return {
      success: false,
      errors: [{ line: '', lineNumber: 0, reason: message }],
      warningCount: 0,
    }
  }

  return parseAplContent(rawContent, specKey, heroTalentTree, patchVersion, sourceUrl)
}

/**
 * Returns the spec keys for which an APL file path is registered.
 * Used to determine which specs can be synced.
 */
export function getSupportedAplSpecs(): string[] {
  return Object.keys(APL_PATHS)
}
