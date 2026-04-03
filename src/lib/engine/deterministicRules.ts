import type { ParsedLog } from '@/lib/specRules/types'

import type { BuffWindow } from './buffStateTracker'
import {
  detectCombustionDuringDowntime,
  detectFireBlastDuringHotStreak,
  detectFireBlastWithoutHeatingUp,
  detectHotStreakExpired,
  detectPhoenixFlamesCap,
  detectScorchWhileStationary,
} from './deterministicRules.rules'
import type { DeterministicViolation } from './engine.types'

// ─── Aggregate ────────────────────────────────────────────────────────────────

/**
 * Accepts pre-built buff windows and runs all deterministic rules against the
 * parsed log. Returns all violations sorted by timestampMs.
 */
export function runDeterministicRules(
  log: ParsedLog,
  windows: BuffWindow[],
): DeterministicViolation[] {
  const violations: DeterministicViolation[] = [
    ...detectFireBlastWithoutHeatingUp(log, windows),
    ...detectFireBlastDuringHotStreak(log, windows),
    ...detectHotStreakExpired(log, windows),
    ...detectPhoenixFlamesCap(log),
    ...detectScorchWhileStationary(log, windows),
    ...detectCombustionDuringDowntime(log, windows),
  ]

  return violations.sort((a, b) => (a.timestampMs ?? 0) - (b.timestampMs ?? 0))
}
