import { z } from 'zod'

import { AplActionSchema } from '@/lib/apl/apl.schemas'
import type { AplAction, ParsedApl } from '@/lib/apl/apl.types'
import { fetchAndParseApl, getSupportedAplSpecs } from '@/lib/apl/aplFetcher'
import { createServiceClient } from '@/lib/supabase/serviceClient'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AplSyncResult {
  specKey: string
  success: boolean
  actionCount: number
  errorCount: number
  error?: string
}

export interface AplSyncSummary {
  total: number
  succeeded: number
  failed: number
  results: AplSyncResult[]
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

interface SpecRotationRow {
  spec_key: string
  hero_talent_tree: string | null
  patch_version: string
  actions: AplAction[]
  raw_content: string
  source_url: string
  parsed_at: string
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches and parses the SimC APL for a single spec, then upserts the result
 * into spec_rotations. Upsert key is (spec_key, hero_talent_tree).
 */
export async function syncSpecApl(specKey: string, patchVersion: string): Promise<AplSyncResult> {
  const parseResult = await fetchAndParseApl(specKey, patchVersion)

  if (!parseResult.success || parseResult.parsed === undefined) {
    const reason = parseResult.errors[0]?.reason ?? 'Parse returned no actions'
    return {
      specKey,
      success: false,
      actionCount: 0,
      errorCount: parseResult.errors.length,
      error: reason,
    }
  }

  const { parsed } = parseResult

  const row: SpecRotationRow = {
    spec_key: parsed.specKey,
    hero_talent_tree: parsed.heroTalentTree ?? null,
    patch_version: parsed.patchVersion,
    actions: parsed.actions,
    raw_content: parsed.rawContent,
    source_url: parsed.sourceUrl,
    parsed_at: parsed.parsedAt,
  }

  const supabase = createServiceClient()
  const { error } = await supabase
    .from('spec_rotations')
    .upsert(row, { onConflict: 'spec_key,hero_talent_tree' })

  if (error) {
    return {
      specKey,
      success: false,
      actionCount: 0,
      errorCount: parseResult.errors.length,
      error: error.message,
    }
  }

  return {
    specKey,
    success: true,
    actionCount: parsed.actions.length,
    errorCount: parseResult.errors.length,
  }
}

/**
 * Syncs all specs registered in APL_PATHS sequentially with a 500ms delay
 * between each to avoid hammering GitHub's servers.
 */
export async function syncAllSpecs(patchVersion: string): Promise<AplSyncSummary> {
  const specKeys = getSupportedAplSpecs()
  const results: AplSyncResult[] = []

  for (let i = 0; i < specKeys.length; i++) {
    const specKey = specKeys[i]
    if (specKey === undefined) continue

    const result = await syncSpecApl(specKey, patchVersion)
    results.push(result)

    if (i < specKeys.length - 1) {
      await new Promise<void>((resolve) => setTimeout(resolve, 500))
    }
  }

  const succeeded = results.filter((r) => r.success).length

  return {
    total: results.length,
    succeeded,
    failed: results.length - succeeded,
    results,
  }
}

/**
 * Queries spec_rotations for a stored APL and reconstructs a ParsedApl.
 * Returns null if no matching row is found.
 */
export async function getSpecRotation(specKey: string): Promise<ParsedApl | null> {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('spec_rotations')
    .select('*')
    .eq('spec_key', specKey)
    .order('parsed_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(`Failed to query spec_rotations: ${error.message}`)
  if (data === null) return null

  let actions: AplAction[]
  try {
    actions = z.array(AplActionSchema).parse(data.actions)
  } catch (err) {
    console.warn(
      `[aplSyncService] actions jsonb failed validation for spec "${specKey}":`,
      err instanceof Error ? err.message : err,
    )
    return null
  }

  const parsed: ParsedApl = {
    specKey: data.spec_key as string,
    patchVersion: data.patch_version as string,
    actions,
    rawContent: data.raw_content as string,
    sourceUrl: data.source_url as string,
    parsedAt: data.parsed_at as string,
    ...(data.hero_talent_tree !== null ? { heroTalentTree: data.hero_talent_tree as string } : {}),
  }

  return parsed
}
