import { env } from '@/config/env'
import { fetchAplContent } from '@/lib/apl/aplFetcher'
import { ALL_BASE_SPECS } from '@/lib/specRules/allBaseSpecs'
import { createServiceClient } from '@/lib/supabase/serviceClient'
import { deriveKnowledgeFromApl } from '@/services/knowledgeSeedHelpers'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SeedResult {
  specKey: string
  heroTalent: string
  success: boolean
  knowledgeLength: number
  error?: string
}

export interface SeedSummary {
  total: number
  succeeded: number
  failed: number
  skipped: number
  results: SeedResult[]
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

// Healer and support specs have no SimC APL — skip rather than fail.
const SPECS_WITHOUT_APL = new Set([
  'druid-restoration',
  'evoker-augmentation',
  'evoker-preservation',
  'monk-mistweaver',
  'paladin-holy',
  'priest-discipline',
  'priest-holy',
  'shaman-restoration',
])

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

async function seedOneSpec(
  specKey: string,
  specName: string,
  heroTalent: string,
  forceRefresh: boolean,
): Promise<SeedResult> {
  if (SPECS_WITHOUT_APL.has(specKey)) {
    return { specKey, heroTalent, success: true, knowledgeLength: -1 }
  }

  const supabase = createServiceClient()

  if (!forceRefresh) {
    const { data: existing } = await supabase
      .from('spec_knowledge')
      .select('knowledge, expires_at')
      .eq('spec_key', specKey)
      .eq('hero_talent', heroTalent)
      .eq('patch_version', env.app.patchVersion)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    const row = existing as { knowledge: string; expires_at: string } | null
    if (row?.knowledge && row.knowledge.length > 50) {
      return { specKey, heroTalent, success: true, knowledgeLength: -1 }
    }
  }

  let aplContent: string
  try {
    aplContent = await fetchAplContent(specKey)
  } catch {
    return {
      specKey,
      heroTalent,
      success: false,
      knowledgeLength: 0,
      error: `APL fetch failed for ${specKey}`,
    }
  }

  const knowledge = await deriveKnowledgeFromApl(
    specName,
    heroTalent,
    aplContent,
    env.app.patchVersion,
  )

  if (knowledge.length < 50) {
    return {
      specKey,
      heroTalent,
      success: false,
      knowledgeLength: knowledge.length,
      error: 'Claude returned insufficient knowledge (< 50 chars)',
    }
  }

  const { error: upsertError } = await supabase.from('spec_knowledge').upsert(
    {
      spec_key: specKey,
      hero_talent: heroTalent,
      patch_version: env.app.patchVersion,
      knowledge,
      expires_at: new Date(Date.now() + THIRTY_DAYS_MS).toISOString(),
    },
    { onConflict: 'spec_key,hero_talent,patch_version' },
  )

  if (upsertError) {
    return {
      specKey,
      heroTalent,
      success: false,
      knowledgeLength: knowledge.length,
      error: upsertError.message,
    }
  }

  return { specKey, heroTalent, success: true, knowledgeLength: knowledge.length }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function seedAllSpecKnowledge(forceRefresh: boolean): Promise<SeedSummary> {
  const results: SeedResult[] = []

  const pairs: Array<{ specKey: string; specName: string; heroTalent: string }> = []
  for (const spec of ALL_BASE_SPECS) {
    if (spec.supportedHeroTalents.length === 0) {
      pairs.push({ specKey: spec.specKey, specName: spec.specName, heroTalent: '' })
    } else {
      for (const heroTalent of spec.supportedHeroTalents) {
        pairs.push({ specKey: spec.specKey, specName: spec.specName, heroTalent })
      }
    }
  }

  for (let i = 0; i < pairs.length; i++) {
    const pair = pairs[i]
    if (pair === undefined) continue

    const result = await seedOneSpec(pair.specKey, pair.specName, pair.heroTalent, forceRefresh)
    results.push(result)

    if (i < pairs.length - 1) {
      await new Promise<void>((resolve) => setTimeout(resolve, 500))
    }
  }

  const succeeded = results.filter((r) => r.success && r.knowledgeLength !== -1).length
  const skipped = results.filter((r) => r.success && r.knowledgeLength === -1).length
  const failed = results.filter((r) => !r.success).length

  return { total: results.length, succeeded, skipped, failed, results }
}
