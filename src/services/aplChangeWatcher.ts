import { env } from '@/config/env'
import { fetchAndParseApl, getSupportedAplSpecs } from '@/lib/apl/aplFetcher'
import { createServiceClient } from '@/lib/supabase/serviceClient'
import { seedAllSpecKnowledge } from '@/services/knowledgeSeedService'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AplChangeResult {
  specKey: string
  status: 'unchanged' | 'updated' | 'failed' | 'skipped'
  oldSha: string | null
  newSha: string | null
  error?: string
}

export interface WatchSummary {
  checkedAt: string
  patchVersionMismatch: boolean
  simcPatchVersion: string | null
  appPatchVersion: string
  total: number
  unchanged: number
  updated: number
  failed: number
  skipped: number
  results: AplChangeResult[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SIMC_REPO = 'simulationcraft/simc'
const SIMC_BRANCH = 'midnight'
const GITHUB_COMMITS_API = `https://api.github.com/repos/${SIMC_REPO}/commits`
const SIMC_PROFILE_URL = `https://raw.githubusercontent.com/${SIMC_REPO}/${SIMC_BRANCH}/profiles/MID1/MID1_Mage_Fire.simc`

// GitHub unauthenticated rate limit: 60 req/hour
// We check ~30 files so need 1200ms between calls to stay safe
const GITHUB_RATE_LIMIT_DELAY_MS = 1_200

// ─── Private Helpers ──────────────────────────────────────────────────────────

/**
 * Reads the patch_version field from the SimC Mage Fire profile.
 * Used to detect expansion-level version changes before anything else runs.
 */
async function fetchSimcPatchVersion(): Promise<string | null> {
  try {
    const response = await fetch(SIMC_PROFILE_URL)
    if (!response.ok) return null
    const text = await response.text()
    const match = text.match(/^patch_version=(.+)$/m)
    return match?.[1]?.trim() ?? null
  } catch {
    return null
  }
}

/**
 * Fetches the latest commit SHA for a single APL file path from GitHub API.
 */
async function fetchLatestSha(filePath: string): Promise<string | null> {
  try {
    const url = `${GITHUB_COMMITS_API}?path=${filePath}&sha=${SIMC_BRANCH}&per_page=1`
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' },
    })
    if (!response.ok) return null
    const data = (await response.json()) as Array<{ sha: string }>
    return data[0]?.sha ?? null
  } catch {
    return null
  }
}

/**
 * Loads all stored SHAs from spec_rotations.
 */
async function loadStoredShas(): Promise<Map<string, string | null>> {
  const supabase = createServiceClient()
  const { data } = await supabase.from('spec_rotations').select('spec_key, simc_sha')
  const map = new Map<string, string | null>()
  for (const row of data ?? []) {
    map.set(row.spec_key as string, (row.simc_sha as string | null) ?? null)
  }
  return map
}

/**
 * Re-parses and upserts a single spec APL, storing the new SHA.
 */
async function updateSpec(specKey: string, newSha: string): Promise<void> {
  const supabase = createServiceClient()
  const parseResult = await fetchAndParseApl(specKey, env.app.patchVersion)

  if (!parseResult.success || parseResult.parsed === undefined) {
    throw new Error(`APL re-parse failed for ${specKey}`)
  }

  const { parsed } = parseResult
  const { error } = await supabase.from('spec_rotations').upsert(
    {
      spec_key: parsed.specKey,
      hero_talent_tree: parsed.heroTalentTree ?? null,
      patch_version: parsed.patchVersion,
      actions: parsed.actions,
      raw_content: parsed.rawContent,
      source_url: parsed.sourceUrl,
      parsed_at: parsed.parsedAt,
      simc_sha: newSha,
    },
    { onConflict: 'spec_key,hero_talent_tree' },
  )

  if (error) throw new Error(error.message)
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Daily check that:
 * 1. Detects expansion-level patch version mismatches and warns — does NOT
 *    auto-update patch version, that is a deliberate human action.
 * 2. For each registered APL file, compares the latest SimC commit SHA
 *    against the stored SHA in spec_rotations.
 * 3. For any changed spec: re-parses the APL, upserts spec_rotations,
 *    and force-reseeds spec_knowledge for all hero talent combinations.
 * 4. Returns a full summary suitable for logging and alerting.
 */
export async function checkAndUpdateChangedApls(): Promise<WatchSummary> {
  const checkedAt = new Date().toISOString()
  const appPatchVersion = env.app.patchVersion

  // Step 1 — check for expansion version mismatch
  const simcPatchVersion = await fetchSimcPatchVersion()
  const patchVersionMismatch = simcPatchVersion !== null && simcPatchVersion !== appPatchVersion

  // Step 2 — load stored SHAs
  const storedShas = await loadStoredShas()
  const specKeys = getSupportedAplSpecs()
  const results: AplChangeResult[] = []

  // Step 3 — check each spec
  for (let i = 0; i < specKeys.length; i++) {
    const specKey = specKeys[i]
    if (specKey === undefined) continue

    // If patch version has changed, skip rotation updates —
    // operator must bump PATCH_VERSION env var and run seed manually first
    if (patchVersionMismatch) {
      results.push({
        specKey,
        status: 'skipped',
        oldSha: storedShas.get(specKey) ?? null,
        newSha: null,
        error: `Patch version mismatch: SimC=${simcPatchVersion} App=${appPatchVersion} — update PATCH_VERSION env var and run /api/admin/seed-knowledge`,
      })
      continue
    }

    const oldSha = storedShas.get(specKey) ?? null
    const newSha = await fetchLatestSha(`/profiles/MID1/${specKey}.simc`)

    if (newSha === null) {
      results.push({ specKey, status: 'failed', oldSha, newSha, error: 'GitHub SHA fetch failed' })
      continue
    }

    if (newSha === oldSha) {
      results.push({ specKey, status: 'unchanged', oldSha, newSha })
      continue
    }

    // SHA changed — update APL and reseed knowledge
    try {
      await updateSpec(specKey, newSha)
      results.push({ specKey, status: 'updated', oldSha, newSha })
    } catch (err) {
      results.push({
        specKey,
        status: 'failed',
        oldSha,
        newSha,
        error: err instanceof Error ? err.message : String(err),
      })
    }

    // Delay between GitHub API calls
    if (i < specKeys.length - 1) {
      await new Promise<void>((resolve) => setTimeout(resolve, GITHUB_RATE_LIMIT_DELAY_MS))
    }
  }

  // Step 4 — if any spec was updated, reseed all knowledge once at the end
  const anyUpdated = results.some((r) => r.status === 'updated')
  if (anyUpdated) {
    await seedAllSpecKnowledge(true)
  }

  return {
    checkedAt,
    patchVersionMismatch,
    simcPatchVersion,
    appPatchVersion,
    total: results.length,
    unchanged: results.filter((r) => r.status === 'unchanged').length,
    updated: results.filter((r) => r.status === 'updated').length,
    failed: results.filter((r) => r.status === 'failed').length,
    skipped: results.filter((r) => r.status === 'skipped').length,
    results,
  }
}
