import type { ParsedLog } from '@/lib/specRules/types'

import type { BuffWindow } from './buffStateTracker'
import type { AplPhase } from './engine.types'

// ─── Constants ────────────────────────────────────────────────────────────────

const COMBUSTION_SPELL_NAME = 'Combustion'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveListName(isCombustion: boolean, heroTalentTree: string | undefined): string {
  if (isCombustion) {
    if (heroTalentTree === 'frostfire') return 'ff_combustion'
    if (heroTalentTree === 'sunfury') return 'sf_combustion'
    return 'combustion'
  }
  if (heroTalentTree === 'frostfire') return 'ff_filler'
  if (heroTalentTree === 'sunfury') return 'sf_filler'
  return 'default'
}

function buildPhase(
  startMs: number,
  endMs: number,
  isCombustion: boolean,
  heroTalentTree: string | undefined,
  log: ParsedLog,
): AplPhase {
  return {
    listName: resolveListName(isCombustion, heroTalentTree),
    heroTalentTree,
    isCombustion,
    isAoe: false,
    startMs,
    endMs,
    castsDuringPhase: log.castEvents.filter(
      (e) => e.timestampMs >= startMs && e.timestampMs < endMs,
    ),
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Detects fight phases from a parsed log by segmenting on Combustion buff windows.
 *
 * Each Combustion window becomes a combustion phase. Gaps before, between, and
 * after Combustion windows become filler phases. The final filler phase extends
 * to log.fightDurationMs.
 *
 * isAoe is always false — target count cannot be derived from the combat log.
 * Returns phases sorted by startMs ascending.
 */
export function detectFightPhases(
  log: ParsedLog,
  heroTalentTree: string | undefined,
  windows: BuffWindow[],
): AplPhase[] {
  const combustionWindows: BuffWindow[] = windows
    .filter((w) => w.spellName === COMBUSTION_SPELL_NAME)
    .sort((a, b) => a.startMs - b.startMs)

  const fightEndMs = log.fightDurationMs
  const phases: AplPhase[] = []

  if (combustionWindows.length === 0) {
    // Entire fight is a single filler phase
    phases.push(buildPhase(0, fightEndMs, false, heroTalentTree, log))
    return phases
  }

  let cursor = 0

  for (const window of combustionWindows) {
    // Filler gap before this Combustion window
    if (window.startMs > cursor) {
      phases.push(buildPhase(cursor, window.startMs, false, heroTalentTree, log))
    }

    // Combustion phase — clamp endMs to fight end if buff never expired
    const combustionEnd = window.endMs !== null ? window.endMs : fightEndMs
    phases.push(buildPhase(window.startMs, combustionEnd, true, heroTalentTree, log))

    cursor = combustionEnd
  }

  // Filler phase after the last Combustion window
  if (cursor < fightEndMs) {
    phases.push(buildPhase(cursor, fightEndMs, false, heroTalentTree, log))
  }

  return phases
}

/**
 * Returns the phase that contains the given timestamp, or null if none match.
 * Uses half-open intervals [startMs, endMs) consistent with phase construction.
 */
export function getPhaseForCast(phases: AplPhase[], timestampMs: number): AplPhase | null {
  return phases.find((p) => timestampMs >= p.startMs && timestampMs < p.endMs) ?? null
}
