import { env } from '@/config/env'
import { fetchAplContent } from '@/lib/apl/aplFetcher'
import { ALL_BASE_SPECS } from '@/lib/specRules/allBaseSpecs'
import { createServiceClient } from '@/lib/supabase/serviceClient'

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

async function deriveKnowledgeFromApl(
  specName: string,
  heroTalent: string,
  aplContent: string,
  patchVersion: string,
): Promise<string> {
  const aplExcerpt = aplContent.slice(0, 6000)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 25_000)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': env.anthropic.apiKey,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: [
          'You are a World of Warcraft SimulationCraft APL expert for patch ' + patchVersion + '.',
          'You read raw SimC APL files and extract precise, factual coaching information.',
          'You answer ONLY from what is explicitly present in the APL — never from general WoW knowledge.',
          'If a value cannot be determined from the APL, write UNKNOWN rather than guessing.',
          'Be concise. No padding. No preamble. Output the facts directly.',
        ].join('\n'),
        messages: [
          {
            role: 'user',
            content: [
              `Spec: ${specName}`,
              `Hero Talent: ${heroTalent}`,
              `Patch: ${patchVersion}`,
              '',
              'Here is the SimC APL file:',
              '```',
              aplExcerpt,
              '```',
              '',
              'From this APL, extract the following. Use ONLY what is in the APL above.',
              '',
              'SECTION 1 — KEY FACTS (list as "FACT N: ...")',
              '- Main resource spender spell and its minimum resource threshold (from conditions like soul_shard>=3)',
              '- Major cooldown spell name (look for the cooldown sub-list or highest-priority use_item/major cd)',
              '- Any buff that gates key spell usage (e.g. buff.heating_up.up before fire_blast)',
              '- Any spells that should NOT be cast when a certain buff is active',
              `- Any ${heroTalent}-specific conditions or spells that only appear in hero-talent branches`,
              '',
              'SECTION 2 — PRIORITY LIST',
              `Write the ${heroTalent} single-target priority as a numbered list (max 8 items).`,
              'Use the spell names exactly as they appear in the APL.',
              'Include the key condition for each spell in plain English (e.g. "only when Heating Up is active").',
              '',
              'SECTION 3 — COMMON MISTAKES',
              'List 3 mistakes a player would make that this APL is designed to prevent.',
              'Base these on the conditions in the APL, not general WoW knowledge.',
              '',
              'Keep the total response under 400 words.',
            ].join('\n'),
          },
        ],
      }),
    })

    clearTimeout(timeoutId)

    if (!response.ok) return ''

    const data = (await response.json()) as { content: Array<{ type: string; text?: string }> }
    const text = data.content
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text ?? '')
      .join('\n')
      .trim()

    return text
  } catch {
    clearTimeout(timeoutId)
    return ''
  }
}

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
