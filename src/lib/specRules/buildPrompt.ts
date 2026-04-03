import { formatAllContextBlocks } from '@/lib/engine/aplContextBuilder'
import type { EngineOutput } from '@/lib/engine/engine.types'

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

interface FightContextInput {
  fightType?: string
  targetCount?: number
  itemLevel?: number
  bossName?: string
  talentTree?: Array<{ id: number; rank: number; nodeID: number; name: string }>
  guideContext?: string
}

const BOSS_MOVEMENT_NOTES: Record<string, string> = {
  'Imperator Averzian':
    'This boss has Void Cascade mechanics requiring movement. Expect 2-4 forced movement windows of 3-5 seconds each. Do not penalize short casting gaps during these windows.',
  'Fallen-King Salhadaar':
    'Heavy movement fight with frequent position changes. Casting downtime of 3-5 seconds is expected and should not be flagged.',
  Vorasius: 'Moderate movement requirements. Short gaps of 2-3 seconds may be mechanic-related.',
  Chimaerus:
    'Heavy AoE fight. Player may be switching targets frequently. Evaluate AoE spell usage favorably.',
}

const FIGHT_TYPE_LABELS: Record<string, string> = {
  raid: 'Raid Boss — single boss encounter with mechanics',
  mythicplus: 'Mythic+ — timed dungeon with multiple packs',
  dungeon: 'Dungeon — normal or heroic dungeon',
  targetdummy: 'Target Dummy — practice only, no mechanics',
}

const FIGHT_TYPE_INSTRUCTIONS: Record<string, string> = {
  raid: 'Player may have forced downtime from mechanics. Do not flag movement gaps as mistakes unless clearly excessive. Boss mechanics take priority over rotation.',
  mythicplus:
    'AoE optimization matters. If target count is 3+ flag single-target spell usage as suboptimal.',
  targetdummy: 'No mechanics to account for. Any downtime or proc waste is a genuine mistake.',
  dungeon: 'Variable target count — evaluate based on the target count provided.',
}

function buildFightContextSection(ctx: FightContextInput): string {
  const lines: string[] = ['## Fight Context']
  const typeLabel =
    ctx.fightType !== undefined
      ? (FIGHT_TYPE_LABELS[ctx.fightType] ?? ctx.fightType)
      : 'not specified'
  lines.push(`- Fight type: ${typeLabel}`)
  lines.push(`- Target count: ${ctx.targetCount ?? 1} target(s)`)
  lines.push(
    `- Item level: ${ctx.itemLevel !== undefined ? String(ctx.itemLevel) : 'not specified'}`,
  )
  if (ctx.fightType !== undefined && FIGHT_TYPE_INSTRUCTIONS[ctx.fightType] !== undefined) {
    lines.push('', FIGHT_TYPE_INSTRUCTIONS[ctx.fightType] as string)
  }
  if (ctx.itemLevel !== undefined) {
    const ilNote =
      ctx.itemLevel < 580
        ? 'Player is still gearing. Be encouraging and focus on fundamental rotation mistakes only.'
        : ctx.itemLevel <= 620
          ? 'Normal progression gear. Standard analysis.'
          : 'Well-geared player. Higher expectations for cooldown optimization and proc efficiency.'
    lines.push('', ilNote)
  }
  if (ctx.fightType === 'mythicplus') {
    lines.push(
      '',
      'NOTE: Mythic+ analysis works best on a single pull segment from WarcraftLogs. The player should select a specific boss or large trash pack fight from their run rather than the full dungeon. Target count is especially important here — set it to reflect the actual number of enemies in the pull being analyzed. AoE spells should be prioritized over single-target when target count is 3 or more.',
    )
  }
  return lines.join('\n')
}

function buildTalentContextSection(
  tree: Array<{ id: number; rank: number; nodeID: number; name: string }>,
): string {
  const knownTalents = tree
    .filter((t) => !t.name.startsWith('Unknown'))
    .map((t) => (t.rank > 1 ? `${t.name} (rank ${t.rank})` : t.name))
  const unknownCount = tree.filter((t) => t.name.startsWith('Unknown')).length
  return [
    'PLAYER TALENT BUILD:',
    'Confirmed talented abilities:',
    ...knownTalents.map((t) => `- ${t}`),
    `(${unknownCount} additional talents not yet in spell database)`,
    '',
    'CRITICAL: Only flag errors for spells that appear in this confirmed talent list. Never coach the player about a spell that is not listed here — they may not have it talented. If a spell does not appear in this list, do not mention it in errors or suggestions.',
  ].join('\n')
}

export function buildSystemPrompt(
  spec: ResolvedSpecDefinition,
  fightContext?: FightContextInput,
): string {
  const heroLine = spec.heroTalentTree
    ? `The player is using the ${spec.heroTalentTree} Hero Talent tree. Factor tree-specific mechanics into your analysis.`
    : ''
  const mistakesList = spec.commonMistakes.map((m, i) => `${i + 1}. ${m}`).join('\n')
  const contextSection = fightContext !== undefined ? buildFightContextSection(fightContext) : ''
  const bossNote =
    fightContext?.bossName !== undefined
      ? BOSS_MOVEMENT_NOTES[fightContext.bossName] !== undefined
        ? `BOSS NOTES: ${BOSS_MOVEMENT_NOTES[fightContext.bossName]}`
        : `BOSS: ${fightContext.bossName} — no specific mechanic notes available. Apply standard raid mechanic tolerance.`
      : ''
  const talentSection =
    fightContext?.talentTree !== undefined ? buildTalentContextSection(fightContext.talentTree) : ''

  const guideContext = fightContext?.guideContext
  const guidePrefix =
    guideContext !== undefined && guideContext.length > 0
      ? [
          'CRITICAL INSTRUCTION — READ BEFORE ANALYZING:',
          'The following facts are from live web searches of current Midnight Season 1 guides. They OVERRIDE your training data. Your training data is WRONG for this patch. These facts are CORRECT:',
          '',
          guideContext,
          '',
          'BEFORE flagging any error you MUST check:',
          "1. Is this ability's cooldown listed above? Use that value.",
          '2. Is this mechanic listed as changed above? Use that.',
          '3. If not listed above, DO NOT assume you know the current patch behavior — omit the error instead.',
          '',
          'When in doubt — DO NOT flag it as an error.',
          'It is better to miss a real error than to flag correct Midnight play as wrong.',
          '',
          '',
        ].join('\n')
      : ''

  const corePrompt = [
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
    bossNote,
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
  const heroTalentLine = engineOutput.heroTalentTree ?? 'not specified'
  const phaseNames = engineOutput.fightPhases.map((p) => p.listName).join(', ')
  const fightContextSection = [
    '## Fight Context',
    `Analyzing ${spec.displayName} — ${fightDurationSeconds}s fight`,
    `Hero Talent: ${heroTalentLine}`,
    `Phases detected: ${engineOutput.fightPhases.length} (${phaseNames})`,
  ].join('\n')
  const { deterministicViolations } = engineOutput
  const confirmedErrors =
    deterministicViolations.length > 0
      ? [
          '## CONFIRMED ROTATION ERRORS (explain these to the player):',
          ...deterministicViolations.map((v) => `- [${v.timestamp}] ${v.context}`),
        ].join('\n')
      : '## CONFIRMED ROTATION ERRORS\nNone detected — look for subtler issues in the APL analysis below.'
  const aplSection = [
    '## APL PHASE ANALYSIS (evaluate priority violations):',
    formatAllContextBlocks(engineOutput.aplContextBlocks),
  ].join('\n')
  const timelineSection = ['## Cast Timeline', timeline].join('\n')
  const instruction = [
    '## Your Task',
    'For each confirmed error above, explain what happened, why it matters, and how to fix it.',
    'For each APL phase, identify any priority violations where the player cast a lower-priority spell when a higher-priority spell was available.',
    'Sound like a helpful raid leader — not a robot.',
    'Return your analysis as valid JSON matching the schema in your instructions.',
  ].join('\n')
  return [
    fightContextSection,
    '',
    confirmedErrors,
    '',
    aplSection,
    '',
    timelineSection,
    '',
    instruction,
  ].join('\n')
}
