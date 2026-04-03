import type { AplAction, AplCondition } from '@/lib/apl/apl.types'

import type { BuffWindow } from './buffStateTracker'
import type { AplContextBlock, AplPhase } from './engine.types'

// ─── Constants ────────────────────────────────────────────────────────────────

const SKIP_SPELL_KEYS = new Set([
  'variable',
  'run_action_list',
  'use_item',
  'potion',
  'use_items',
  'invoke_external_buff',
  'call_action_list',
])

const RELEVANT_BUFF_NAMES = new Set(['heating up', 'hot streak', 'combustion'])

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMs(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function isRelevantBuff(spellName: string): boolean {
  const lower = spellName.toLowerCase()
  return RELEVANT_BUFF_NAMES.has(lower) || lower.includes('streak') || lower.includes('proc')
}

/** Normalises a spell name or key to a bare lowercase token for comparison. */
function normalizeSpell(name: string): string {
  return name.toLowerCase().replace(/[\s_-]/g, '')
}

function formatCondition(c: AplCondition): string {
  const neg = c.negated ? 'not ' : ''
  switch (c.type) {
    case 'buff_active':
      return `${neg}${c.subject} active`
    case 'buff_missing':
      return `${neg}${c.subject} missing`
    case 'cooldown_ready':
      return `${neg}${c.subject} ready`
    case 'resource_gte':
      return `${neg}${c.subject} >= ${c.value ?? '?'}`
    case 'resource_lte':
      return `${neg}${c.subject} <= ${c.value ?? '?'}`
    case 'talent_selected':
      return `${neg}${c.subject} talented`
    case 'hero_talent_selected':
      return `${neg}hero:${c.subject}`
    case 'target_count_gte':
      return `${neg}targets >= ${c.value ?? '?'}`
    case 'unknown':
      return `${neg}${c.raw}`
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Builds a single APL context block for one fight phase.
 *
 * Filters aplActions to the phase's listName, removes non-evaluable spell keys,
 * formats the player's cast sequence, and collects buff activity that overlaps
 * the phase window.
 */
export function buildAplContextBlock(
  phase: AplPhase,
  aplActions: AplAction[],
  buffWindows: BuffWindow[],
): AplContextBlock {
  const priorityActions = aplActions
    .filter((a) => a.listName === phase.listName && !SKIP_SPELL_KEYS.has(a.spellKey))
    .sort((a, b) => a.priority - b.priority)

  const playerCasts = phase.castsDuringPhase.map((e) => `[${e.timestamp}] ${e.spellName}`)

  const relevantBuffs = buffWindows
    .filter((w) => isRelevantBuff(w.spellName))
    .filter((w) => w.startMs < phase.endMs && (w.endMs === null || w.endMs > phase.startMs))
    .map((w) => {
      const start = formatMs(Math.max(w.startMs, phase.startMs))
      const end = formatMs(w.endMs !== null ? Math.min(w.endMs, phase.endMs) : phase.endMs)
      return `${w.spellName} active ${start}-${end}`
    })

  return { phase, priorityActions, playerCasts, relevantBuffs, buffWindows }
}

/**
 * Builds context blocks for all phases, discarding phases where the player
 * cast nothing (empty phases add noise for the AI).
 */
export function buildAllContextBlocks(
  phases: AplPhase[],
  aplActions: AplAction[],
  buffWindows: BuffWindow[],
): AplContextBlock[] {
  return phases
    .map((p) => buildAplContextBlock(p, aplActions, buffWindows))
    .filter((b) => b.playerCasts.length > 0)
}

/**
 * Formats one context block as a human-readable string for inclusion in the
 * Claude prompt. Annotates player casts that fall outside the APL priority list.
 */
export function formatContextBlockForPrompt(block: AplContextBlock): string {
  const { phase, priorityActions, playerCasts, relevantBuffs } = block

  const phaseStart = formatMs(phase.startMs)
  const phaseEnd = formatMs(phase.endMs)
  const phaseLabel = phase.isCombustion ? 'Combustion active' : 'Filler'

  const lines: string[] = [
    `=== Phase: ${phase.listName} (${phaseLabel}, ${phaseStart}-${phaseEnd}) ===`,
  ]

  lines.push('APL Priority (what should have happened):')
  if (priorityActions.length === 0) {
    lines.push('  (no APL entries for this phase)')
  } else {
    for (const action of priorityActions) {
      const condSummary =
        action.conditions.length > 0
          ? ` — if ${action.conditions.map(formatCondition).join(', ')}`
          : ''
      lines.push(`${action.priority}. ${action.spellKey}${condSummary}`)
    }
  }

  lines.push('')
  lines.push('What the player cast:')

  const aplKeys = new Set(priorityActions.map((a) => normalizeSpell(a.spellKey)))
  for (const cast of playerCasts) {
    // Extract spell name from "[0:14] Fire Blast"
    const spellName = cast.replace(/^\[\d+:\d+\]\s*/, '')
    const inApl = aplKeys.size > 0 && aplKeys.has(normalizeSpell(spellName))
    lines.push(inApl ? cast : `${cast}  ← not in APL priority for this phase`)
  }

  if (relevantBuffs.length > 0) {
    lines.push('')
    lines.push('Active buffs during phase:')
    for (const buff of relevantBuffs) {
      lines.push(buff)
    }
  }

  return lines.join('\n')
}

/**
 * Joins all formatted context blocks with a double newline.
 * Used as the APL context section in the Claude prompt.
 */
export function formatAllContextBlocks(blocks: AplContextBlock[]): string {
  return blocks.map(formatContextBlockForPrompt).join('\n\n')
}
