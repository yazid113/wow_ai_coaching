export interface FightContextInput {
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

export function buildGuideSection(guideContext: string): string {
  return [
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
}

export function buildFightContextSection(ctx: FightContextInput): string {
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
  if (ctx.bossName !== undefined) {
    const bossNote =
      BOSS_MOVEMENT_NOTES[ctx.bossName] !== undefined
        ? `BOSS NOTES: ${BOSS_MOVEMENT_NOTES[ctx.bossName]}`
        : `BOSS: ${ctx.bossName} — no specific mechanic notes available. Apply standard raid mechanic tolerance.`
    lines.push('', bossNote)
  }
  return lines.join('\n')
}

export function buildTalentSection(
  talentTree: Array<{ id: number; rank: number; nodeID: number; name: string }>,
): string {
  const knownTalents = talentTree
    .filter((t) => !t.name.startsWith('Unknown'))
    .map((t) => (t.rank > 1 ? `${t.name} (rank ${t.rank})` : t.name))
  const unknownCount = talentTree.filter((t) => t.name.startsWith('Unknown')).length
  return [
    'PLAYER TALENT BUILD:',
    'Confirmed talented abilities:',
    ...knownTalents.map((t) => `- ${t}`),
    `(${unknownCount} additional talents not yet in spell database)`,
    '',
    'CRITICAL: Only flag errors for spells that appear in this confirmed talent list. Never coach the player about a spell that is not listed here — they may not have it talented. If a spell does not appear in this list, do not mention it in errors or suggestions.',
  ].join('\n')
}
