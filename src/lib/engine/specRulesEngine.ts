import { buildAllContextBlocks } from './aplContextBuilder'
import { buildBuffWindows } from './buffStateTracker'
import { runDeterministicRules } from './deterministicRules'
import type { EngineInput, EngineOutput } from './engine.types'
import { detectFightPhases } from './phaseDetector'

// ─── Engine ───────────────────────────────────────────────────────────────────

/**
 * Runs the full hybrid analysis pipeline for one fight log.
 *
 * Step 1 — Buff windows are built once from the log and reused by the context
 *           builder. (Deterministic rules and phase detector build their own
 *           windows internally via their current signatures.)
 * Step 2 — Deterministic rules produce provably correct violations.
 * Step 3 — Phase detector segments the fight on Combustion windows.
 * Step 4 — APL context builder assembles per-phase blocks for the AI prompt.
 */
export function runEngine(input: EngineInput): EngineOutput {
  // Step 1 — build buff windows once for reuse
  const buffWindows = buildBuffWindows(input.log.buffEvents)

  // Step 2 — deterministic violations
  const deterministicViolations = runDeterministicRules(input.log, buffWindows)

  // Step 3 — fight phase segmentation
  const fightPhases = detectFightPhases(input.log, input.heroTalentTree, buffWindows)

  // Step 4 — APL context blocks (buff windows passed in, not rebuilt)
  const aplContextBlocks = buildAllContextBlocks(fightPhases, input.aplActions, buffWindows)

  return {
    deterministicViolations,
    aplContextBlocks,
    fightPhases,
    specKey: input.resolvedSpec.specKey,
    heroTalentTree: input.heroTalentTree,
  }
}

// ─── Diagnostics ─────────────────────────────────────────────────────────────

/**
 * Returns a single-line plain-text summary of engine output for logging.
 * Example: "Engine: 3 deterministic violations, 4 phases detected,
 *           3 context blocks — phases: default, ff_combustion, ff_filler"
 */
export function summarizeEngineOutput(output: EngineOutput): string {
  const phaseList = output.fightPhases.map((p) => p.listName).join(', ')
  return (
    `Engine: ${output.deterministicViolations.length} deterministic violations, ` +
    `${output.fightPhases.length} phases detected, ` +
    `${output.aplContextBlocks.length} context blocks — phases: ${phaseList}`
  )
}
