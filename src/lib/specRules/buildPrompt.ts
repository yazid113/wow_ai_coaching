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
    'Specifically for Demonology Warlock:',
    '- Tyrant is now pressed when Dreadstalkers are active',
    '- The DoA window AFTER Tyrant is where damage happens',
    '- Pre-Tyrant HoG count matters less than post-Tyrant HoG spam',
    '- Judge the DoA window execution, not the pre-Tyrant setup',
    '',
    '## Common Mistakes to Watch For',
    mistakesList,
    '',
    '## Scoring',
    GRADE_SCALE,
    '',
    'SCORING CALIBRATION:',
    '- Score 90-100 (S/A+): Near-perfect execution, only cosmetic errors',
    '- Score 80-89 (A): Strong play, 1-2 meaningful errors',
    '- Score 70-79 (B): Solid fundamentals, 3-4 real errors',
    '- Score 60-69 (C): Several meaningful mistakes',
    '- Score below 60: Fundamental rotation issues',
    '',
    'IMPORTANT: Before penalizing an action, verify it is actually wrong by checking:',
    '1. Is this error type specifically mentioned as wrong in the current guide context?',
    '2. Could this be correct Midnight play that differs from pre-Midnight behavior?',
    '3. Is the cooldown math correct — account for haste reducing cooldowns by 15-30% at typical gear levels',
    '',
    'A player casting abilities at near-cooldown intervals with consistent core ability usage should score 85+ even if minor timing optimizations exist.',
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
