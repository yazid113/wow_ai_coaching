import { runEngine } from '@/lib/engine/specRulesEngine'
import { parseLog } from '@/lib/logParser'
import { AnalysisResponseSchema } from '@/lib/schemas/analysis.schema'
import type { AnalysisResponse, Grade } from '@/lib/schemas/analysis.schema'
import { getResolvedSpec } from '@/lib/specRules'
import type { ParsedLog } from '@/lib/specRules'
import { buildSystemPrompt, buildUserPrompt } from '@/lib/specRules/buildPrompt'
import { createServiceClient } from '@/lib/supabase/serviceClient'

import { getSpecRotation } from './aplSyncService'
import { callClaudeAnalysis } from './claudeApiService'
import { getSpecKnowledge } from './specKnowledgeService'
import { syncTalentSpells } from './talentSyncService'

// ─── Error ────────────────────────────────────────────────────────────────────

type AnalyzeErrorCode = 'SPEC_NOT_FOUND' | 'CLAUDE_ERROR' | 'PARSE_ERROR'

export class AnalyzeServiceError extends Error {
  code: AnalyzeErrorCode

  constructor(code: AnalyzeErrorCode, message: string) {
    super(message)
    this.name = 'AnalyzeServiceError'
    this.code = code
  }
}

// ─── I/O Types ────────────────────────────────────────────────────────────────

export interface AnalyzeInput {
  /** Raw WoW combat log text (CLF format). Omit when parsedLog is provided. */
  rawLog?: string | undefined
  /** Pre-parsed log (e.g. from WCL). When provided, rawLog parsing is skipped. */
  parsedLogOverride?: ParsedLog | undefined
  specKey: string
  heroTalentTree?: string | undefined
  /** Player name hint for GUID detection — optional but improves accuracy. */
  playerName?: string | undefined
  /** Manual fight duration override (seconds) — used for raw log paste flow when timestamps are unreliable. */
  fightDurationSeconds?: number | undefined
  /** Fight type context provided by the player. */
  fightType?: string | undefined
  /** Number of targets the player was cleaving. */
  targetCount?: number | undefined
  /** Player's average item level. */
  itemLevel?: number | undefined
  /** Boss name for mechanic-aware analysis. */
  bossName?: string | undefined
  /** Talent tree entries from WCL CombatantInfo. */
  talentTree?: Array<{ id: number; rank: number; nodeID: number; name?: string }> | undefined
  /** Authenticated user ID — used to persist the analysis result. */
  userId: string
}

export interface AnalyzeOutput extends AnalysisResponse {
  /** Row ID of the saved analysis, undefined if the DB insert failed. */
  analysisId?: string | undefined
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

/** Formats the player's successful cast sequence as a flat text timeline. */
function buildCastTimeline(log: ParsedLog): string {
  const successfulCasts = log.castEvents.filter((e) => e.success)
  if (successfulCasts.length === 0) return '(no cast events)'
  return successfulCasts.map((e) => `[${e.timestamp}] ${e.spellName}`).join('\n')
}

/**
 * Persists a completed analysis to the database and increments the user's
 * monthly usage counter. Returns the inserted row ID, or undefined on failure.
 * DB errors are non-fatal — the caller returns a successful result regardless.
 */
async function saveAnalysis(
  userId: string,
  input: AnalyzeInput,
  result: AnalysisResponse,
  fightDurationSeconds: number,
): Promise<string | undefined> {
  const supabase = createServiceClient()

  const { data: inserted, error: insertError } = await supabase
    .from('analyses')
    .insert({
      user_id: userId,
      spec_key: input.specKey,
      hero_talent_tree: input.heroTalentTree ?? null,
      fight_duration: fightDurationSeconds,
      score: result.score,
      grade: result.grade,
      summary: result.summary,
      errors: result.errors,
      wins: result.wins,
      top_focus: result.top_focus,
      raw_log: input.rawLog ?? null,
    })
    .select('id')
    .single()

  if (insertError !== null) {
    return undefined
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('analyses_this_month')
    .eq('id', userId)
    .single()

  if (profile !== null) {
    await supabase
      .from('profiles')
      .update({ analyses_this_month: (profile.analyses_this_month ?? 0) + 1 })
      .eq('id', userId)
  }

  return inserted.id as string
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Runs the full analysis pipeline for one fight log.
 *
 * 1. Parses the raw CLF log into structured events.
 * 2. Resolves the spec definition (base + hero talent overlay).
 * 3. Loads the stored APL from spec_rotations.
 * 4. Runs the hybrid engine (deterministic violations + APL context blocks).
 * 5. Builds system and user prompts.
 * 6. Calls Claude and validates the JSON response.
 * 7. Persists the result and returns it with the saved row ID.
 *
 * Throws AnalyzeServiceError with a typed code on any unrecoverable failure.
 * DB persistence failures are non-fatal — result is returned regardless.
 */
export async function analyzeLog(input: AnalyzeInput): Promise<AnalyzeOutput> {
  const {
    rawLog,
    parsedLogOverride,
    specKey,
    heroTalentTree,
    playerName,
    fightDurationSeconds: fightDurationSecondsOverride,
    userId,
  } = input

  // Step 1 — parse log (skip if a pre-parsed log was provided)
  const log: ParsedLog =
    parsedLogOverride !== undefined ? parsedLogOverride : parseLog(rawLog ?? '', playerName).log

  // Step 2 — resolve spec
  const resolvedSpec = getResolvedSpec(
    specKey,
    heroTalentTree as Parameters<typeof getResolvedSpec>[1],
  )
  if (resolvedSpec === null) {
    const treeSuffix = heroTalentTree !== undefined ? ` with hero talent "${heroTalentTree}"` : ''
    throw new AnalyzeServiceError(
      'SPEC_NOT_FOUND',
      `No spec registered for "${specKey}"${treeSuffix}`,
    )
  }

  // Step 3 — load APL (graceful degradation: missing APL continues with empty actions)
  const parsedApl = await getSpecRotation(specKey)

  // Step 4 — run engine
  const engineOutput = runEngine({
    log,
    resolvedSpec,
    aplActions: parsedApl?.actions ?? [],
    ...(heroTalentTree !== undefined ? { heroTalentTree } : {}),
  })

  // Step 5 — build prompts
  const fightDurationSeconds =
    fightDurationSecondsOverride ?? Math.round(log.fightDurationMs / 1_000)
  const timeline = buildCastTimeline(log)
  const guideContext = await getSpecKnowledge(
    input.specKey,
    input.heroTalentTree ?? '',
    resolvedSpec.specName,
    '11.1',
  )
  const fightCtx = {
    ...(input.fightType !== undefined && { fightType: input.fightType }),
    ...(input.targetCount !== undefined && { targetCount: input.targetCount }),
    ...(input.itemLevel !== undefined && { itemLevel: input.itemLevel }),
    ...(input.bossName !== undefined && { bossName: input.bossName }),
    ...(input.talentTree !== undefined && {
      talentTree: input.talentTree.map((t) => ({ ...t, name: t.name ?? `Unknown (ID: ${t.id})` })),
    }),
    ...(guideContext !== '' && { guideContext }),
  }
  const systemPrompt = buildSystemPrompt(resolvedSpec, fightCtx)
  const userPrompt = buildUserPrompt({
    spec: resolvedSpec,
    engineOutput,
    fightDurationSeconds,
    timeline,
    fightContext: fightCtx,
  })

  // Step 6 — call Claude
  let rawContent: string
  try {
    rawContent = await callClaudeAnalysis(systemPrompt, userPrompt)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new AnalyzeServiceError('CLAUDE_ERROR', msg)
  }

  // Step 7 — validate response
  let validatedResult: AnalysisResponse
  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON object found in response')
    }
    const parsed = JSON.parse(jsonMatch[0]) as unknown
    const schemaResult = AnalysisResponseSchema.safeParse(parsed)
    if (!schemaResult.success) {
      throw new Error(`Schema validation failed: ${schemaResult.error.message}`)
    }
    validatedResult = schemaResult.data
  } catch (parseError) {
    console.error('[AnalyzeService] JSON parse failed:', parseError)
    console.error('[AnalyzeService] Raw response that failed:', rawContent.slice(0, 500))
    return {
      score: 75,
      grade: 'B' as Grade,
      summary: 'Analysis completed but response formatting failed. Please try again.',
      errors: [],
      wins: [],
      top_focus: 'Please run the analysis again for detailed feedback.',
    }
  }

  // Step 8 — persist
  const analysisId = await saveAnalysis(userId, input, validatedResult, fightDurationSeconds)

  // Step 9 — sync any unseen talent IDs into spells table
  if (input.talentTree !== undefined) {
    await syncTalentSpells(input.talentTree)
  }

  return { ...validatedResult, ...(analysisId !== undefined ? { analysisId } : {}) }
}
