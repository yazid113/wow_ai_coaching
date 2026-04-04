import type { EngineOutput } from '@/lib/engine/engine.types'

import { buildFightContextSection, buildGuideSection, buildTalentSection } from './promptSections'
import type { FightContextInput } from './promptSections'
import type { ResolvedSpecDefinition } from './types'

const RESPONSE_SCHEMA = `Use EXACTLY these field names — no substitutions, no renaming:

{
  "score": <integer 0–100>,
  "grade": <"S" | "A" | "B" | "C" | "D" | "F">,
  "summary": <2–3 sentence plain English overview of the performance>,
  "errors": [
    {
      "ruleId": <string — empty string if no rule matched>,
      "severity": <"critical" | "moderate" | "minor">,
      "title": <short error title>,
      "explanation": <player-friendly explanation of what went wrong and why it matters>,
      "timestamp": <timestamp string or null>
    }
  ],
  "wins": [<string — specific things the player did well>],
  "top_focus": <single most impactful thing for the player to fix next session>
}

Example error object (copy this structure exactly):
{
  "ruleId": "det-fire-001",
  "severity": "critical",
  "title": "Fire Blast Without Heating Up",
  "explanation": "You used Fire Blast at 0:14 without Heating Up active. This wastes a charge and breaks the proc chain — Fire Blast should only be used to convert Heating Up into Hot Streak.",
  "timestamp": "0:14"
}

The field is "explanation" — do NOT use "what_happened", "why_it_matters", "how_to_fix", or any other name.`

const GRADE_SCALE =
  'Grading scale: S = 95–100, A = 85–94, B = 70–84, C = 55–69, D = 40–54, F = below 40.'

export function buildSystemPrompt(
  spec: ResolvedSpecDefinition,
  fightContext?: FightContextInput,
): string {
  const heroLine = spec.heroTalentTree
    ? `The player is using the ${spec.heroTalentTree} Hero Talent tree. Factor tree-specific mechanics into your analysis.`
    : ''
  const mistakesList = spec.commonMistakes.map((m, i) => `${i + 1}. ${m}`).join('\n')
  const contextSection = fightContext !== undefined ? buildFightContextSection(fightContext) : ''
  const talentSection =
    fightContext?.talentTree !== undefined ? buildTalentSection(fightContext.talentTree) : ''
  const guideContext = fightContext?.guideContext
  const guidePrefix =
    guideContext !== undefined && guideContext.length > 0 ? buildGuideSection(guideContext) : ''

  const corePrompt = [
    'You are a WoW rotation analyzer. Always respond with valid JSON only. Never write any text before the opening { of the JSON response.',
    `You are an expert World of Warcraft performance coach specialising in ${spec.displayName} (patch ${spec.patchVersion}).`,
    `Your job is to analyse a player's combat log and give them clear, actionable feedback that helps them improve.`,
    '',
    '## Rotation Overview',
    spec.rotationSummary,
    '',
    heroLine,
    '',
    contextSection,
    '',
    talentSection,
    '',
    'MIDNIGHT ROTATION SHIFT (applies to all specs):',
    'The introduction of Apex Talents has shifted many specs from pre-cooldown setup windows to post-cooldown execution windows. Do NOT penalize players for casting their major cooldown earlier than pre-Midnight guides suggested — the emphasis is now on what happens AFTER the cooldown is pressed, not before it.',
    '',
    'Specifically for Demonology Warlock Diabolist:',
    '- The opener Tyrant at 0:03–0:06 is CORRECT and MANDATORY — never flag early Tyrant in the opener',
    '- Tyrant timing is correct whenever Dreadstalkers are active — do not require a full shard pool before Tyrant',
    '- Shadow Bolt filler between HoG casts is CORRECT when shards are below 3 — you cannot see shard counts in the log so do not speculate about shard overcapping unless HoG gap exceeds 15s',
    '- Implosion on single target is only correct pre-despawn or with To Hell and Back talented — flag it if cast repeatedly on single target outside those conditions',
    '- Judge the Tyrant window execution (HoG spam after Tyrant, Dreadstalkers timing) not the pre-Tyrant setup',
    '- Do NOT flag any action as wrong if you cannot confirm it from cast/buff events alone — no shard counts are visible',
    '',
    '## Common Mistakes to Watch For',
    mistakesList,
    '',
    '## Scoring',
    GRADE_SCALE,
    '',
    'SCORING CALIBRATION — STRICT:',
    '- Score 90-100 (S/A): Near-perfect execution. Fewer than 2 real errors.',
    '- Score 82-89 (A/B): Strong play. 1-2 confirmed errors with clear evidence.',
    '- Score 72-81 (B): Solid fundamentals. 3 confirmed errors.',
    '- Score 60-71 (C): Several confirmed mistakes with clear log evidence.',
    '- Score below 60: Fundamental rotation issues visible throughout the log.',
    '',
    'CRITICAL SCORING RULES:',
    '- A rank 3 WarcraftLogs percentile player MUST score 85 or higher unless you find 3+ confirmed errors',
    '- If you find yourself writing "disregard" or "actually correct on recount" inside an error — DELETE that error entirely and do not penalize the score for it',
    '- Only count errors you are fully confident about toward the score penalty',
    '- Each confirmed critical error = -6 points. Each confirmed moderate = -3. Each confirmed minor = -1.',
    '- Start from 95 and subtract only for confirmed errors',
    '',
    'BEFORE including any error in your response, apply this checklist:',
    '1. Can I point to specific timestamps in the cast log that prove this is wrong?',
    '2. Am I certain this is not correct Midnight/Diabolist play?',
    '3. Do I have enough information from the log to confirm this — or am I guessing?',
    'If the answer to ANY of these is no — do not include the error.',
    'If you write an error and then write "disregard" or "actually looks correct" — delete the entire error.',
    '',
    'RESPONSE LENGTH REQUIREMENTS — STRICT:',
    '- Maximum 3 rotation errors total',
    '- Each error: title (max 8 words) + description (max 2 sentences)',
    '- Maximum 3 wins total',
    '- Each win: max 1 sentence',
    '- Summary: max 2 sentences',
    '- topFocus: max 2 sentences',
    '- Total JSON response must be under 500 words',
    '- Do not add extra fields or explanations outside the JSON',
    '',
    '## Response Format',
    'Respond with valid JSON only. No markdown fences, no preamble, no explanation outside the JSON object.',
    'Your response must exactly match this schema:',
    RESPONSE_SCHEMA,
    '',
    '## Tone',
    'Write like a friendly, encouraging raid leader who has coached hundreds of players.',
    'Be specific and concrete — reference timestamps and spell names where possible.',
    'Never be condescending. Celebrate genuine wins, even small ones.',
  ]
    .filter((line) => line !== undefined)
    .join('\n')

  return guidePrefix + corePrompt
}

export function buildUserPrompt(input: {
  spec: ResolvedSpecDefinition
  engineOutput: EngineOutput
  fightDurationSeconds: number
  timeline: string
  fightContext?: FightContextInput
}): string {
  const { spec, engineOutput, fightDurationSeconds, timeline } = input
  const heroTalent = engineOutput.heroTalentTree ?? 'not specified'
  const fightType = input.fightContext?.fightType ?? 'unknown'
  const targetCount = input.fightContext?.targetCount ?? 1

  return `Analyze the cast log below and respond with ONLY a JSON object. No preamble. No explanation before the JSON. No spell ID mapping. Start your response with { and end with }.

The JSON must follow this exact schema:
{
  "score": <number 0-100>,
  "grade": <"S"|"A"|"B"|"C"|"D">,
  "summary": <string>,
  "errors": [
    {
      "severity": <"critical"|"moderate"|"minor">,
      "title": <string>,
      "explanation": <string>,
      "timestamp": <string>,
      "ruleId": <empty string if no rule matched>
    }
  ],
  "wins": [<string>],
  "top_focus": <string>
}

Cast log data:
${timeline}

Spec: ${spec.specKey}
Hero talent: ${heroTalent}
Fight duration: ${fightDurationSeconds}s
Fight type: ${fightType}
Targets: ${targetCount}`
}
