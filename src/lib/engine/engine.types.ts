import type { AplAction } from '@/lib/apl/apl.types'
import type { CastEvent, ParsedLog, ResolvedSpecDefinition, Severity } from '@/lib/specRules/types'

import type { BuffWindow } from './buffStateTracker'

// ─── Deterministic Tier ───────────────────────────────────────────────────────

/**
 * A rule violation produced by the deterministic tier — provably correct from
 * buff aura events alone, with zero false positives.
 */
export interface DeterministicViolation {
  /** ID of the SpecRule that produced this violation. */
  ruleId: string
  /** Formatted timestamp string from the combat log event. */
  timestamp: string
  /** Impact level of this violation on player performance. */
  severity: Severity
  /** Short human-readable label for the violation, e.g. "Fire Blast Without Heating Up". */
  title: string
  /** Plain English description of what happened at this timestamp. */
  context: string
  /** Name of the spell involved in the violation. */
  spellName: string
  /** Snapshot of relevant buff states active at the moment of the cast. */
  buffState: Record<string, boolean>
  /** Numeric timestamp in milliseconds from fight start, for sorting. */
  timestampMs?: number | undefined
}

// ─── Phase Modelling ──────────────────────────────────────────────────────────

/**
 * A named segment of the fight mapped to an APL sub-list.
 * Phases are derived from buff events (e.g. Combustion active) and target
 * count, then matched to the corresponding APL list for AI evaluation.
 */
export interface AplPhase {
  /** APL sub-list name this phase maps to, e.g. "ff_combustion" or "default". */
  listName: string
  /** Hero talent tree active during this phase, if tree-specific routing applies. */
  heroTalentTree?: string | undefined
  /** True when Combustion is active during this phase. */
  isCombustion: boolean
  /** True when target count is 3 or more, indicating AoE priority. */
  isAoe: boolean
  /** Phase start time in milliseconds from fight start. */
  startMs: number
  /** Phase end time in milliseconds from fight start. */
  endMs: number
  /** All cast events that occurred within this phase window. */
  castsDuringPhase: CastEvent[]
}

// ─── AI Tier Context ──────────────────────────────────────────────────────────

/**
 * Structured APL context for a single fight phase, sent to Claude for
 * priority violation and cooldown alignment analysis.
 */
export interface AplContextBlock {
  /** The fight phase this block describes. */
  phase: AplPhase
  /**
   * APL actions matching this phase's listName, in priority order.
   * Skips non-evaluable spellKeys: variable, run_action_list, use_item, potion.
   */
  priorityActions: AplAction[]
  /**
   * Human-readable cast sequence during this phase.
   * Format: ["0:14 Fire Blast", "0:16 Pyroblast"]
   */
  playerCasts: string[]
  /**
   * Human-readable buff activity relevant to this phase.
   * Format: ["Heating Up active 0:13–0:15", "Hot Streak active 0:15–0:17"]
   */
  relevantBuffs: string[]
  /** Raw buff windows for this phase, available for downstream processing. */
  buffWindows: BuffWindow[]
}

// ─── Engine I/O ───────────────────────────────────────────────────────────────

/** All inputs required to run a full hybrid engine analysis. */
export interface EngineInput {
  /** Parsed combat log for the fight being analysed. */
  log: ParsedLog
  /** Fully resolved spec definition including hero talent overlay if applicable. */
  resolvedSpec: ResolvedSpecDefinition
  /** All APL actions for this spec, fetched from spec_rotations. */
  aplActions: AplAction[]
  /** Hero talent tree the player is using, if known. */
  heroTalentTree?: string | undefined
}

/** All outputs produced by the hybrid engine, consumed by the AI prompt builder. */
export interface EngineOutput {
  /** Violations produced by the deterministic tier — zero false positives. */
  deterministicViolations: DeterministicViolation[]
  /** Per-phase APL context blocks ready to be serialised into the AI prompt. */
  aplContextBlocks: AplContextBlock[]
  /** All fight phases identified during log analysis. */
  fightPhases: AplPhase[]
  /** Spec key for the analysed spec, e.g. "mage-fire". */
  specKey: string
  /** Hero talent tree active during the fight, if applicable. */
  heroTalentTree?: string | undefined
}
