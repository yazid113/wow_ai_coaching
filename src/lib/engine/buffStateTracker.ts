import type { BuffEvent } from '@/lib/specRules/types'

// ─── Types ────────────────────────────────────────────────────────────────────

/** A continuous window during which a buff was active. */
export interface BuffWindow {
  spellId: string
  spellName: string
  /** Time the buff was gained, in milliseconds from fight start. */
  startMs: number
  /** Time the buff expired, or null if it was still active at fight end. */
  endMs: number | null
}

/**
 * Snapshot of buff active states at a specific timestamp.
 * Keys are lowercase spell names, values are true if active.
 */
export type BuffStateAtTime = Record<string, boolean>

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Builds a list of continuous buff windows from a flat sequence of buff events.
 *
 * Rules:
 * - 'gained' opens a new window.
 * - 'expired' closes the most recent open window for that spellId.
 * - 'refreshed' closes the current window and immediately opens a new one.
 * - Windows with no matching expiry have endMs = null (still active at fight end).
 *
 * Returns all windows sorted by startMs ascending.
 */
export function buildBuffWindows(buffEvents: BuffEvent[]): BuffWindow[] {
  // Map from spellId → stack of open window start times
  const openWindows = new Map<string, { startMs: number; spellName: string }[]>()
  const closed: BuffWindow[] = []

  const sorted = [...buffEvents].sort((a, b) => a.timestampMs - b.timestampMs)

  for (const event of sorted) {
    const { spellId, spellName, timestampMs, type } = event

    if (type === 'gained') {
      const stack = openWindows.get(spellId) ?? []
      stack.push({ startMs: timestampMs, spellName })
      openWindows.set(spellId, stack)
    } else if (type === 'expired') {
      const stack = openWindows.get(spellId)
      if (stack !== undefined && stack.length > 0) {
        const open = stack.pop()
        if (open !== undefined) {
          closed.push({
            spellId,
            spellName: open.spellName,
            startMs: open.startMs,
            endMs: timestampMs,
          })
        }
        if (stack.length === 0) openWindows.delete(spellId)
      }
    } else if (type === 'refreshed') {
      const stack = openWindows.get(spellId)
      if (stack !== undefined && stack.length > 0) {
        const open = stack.pop()
        if (open !== undefined) {
          closed.push({
            spellId,
            spellName: open.spellName,
            startMs: open.startMs,
            endMs: timestampMs,
          })
        }
      }
      // Open a new window immediately at the refresh timestamp
      const newStack = openWindows.get(spellId) ?? []
      newStack.push({ startMs: timestampMs, spellName })
      openWindows.set(spellId, newStack)
    }
  }

  // Flush any remaining open windows (no expiry seen — still active at fight end)
  for (const [spellId, stack] of Array.from(openWindows)) {
    for (const open of stack) {
      closed.push({ spellId, spellName: open.spellName, startMs: open.startMs, endMs: null })
    }
  }

  return closed.sort((a, b) => a.startMs - b.startMs)
}

/**
 * Returns true if the named buff has an active window covering the given timestamp.
 * Comparison is case-insensitive on spellName.
 */
export function isBuffActiveAt(
  windows: BuffWindow[],
  spellName: string,
  timestampMs: number,
): boolean {
  const lower = spellName.toLowerCase()
  return windows.some(
    (w) =>
      w.spellName.toLowerCase() === lower &&
      w.startMs <= timestampMs &&
      (w.endMs === null || timestampMs < w.endMs),
  )
}

/**
 * Returns a snapshot of which buffs in `spellNames` are active at `timestampMs`.
 * Keys in the returned record are lowercase spell names.
 */
export function getBuffStateAt(
  windows: BuffWindow[],
  timestampMs: number,
  spellNames: string[],
): BuffStateAtTime {
  const result: BuffStateAtTime = {}
  for (const name of spellNames) {
    result[name.toLowerCase()] = isBuffActiveAt(windows, name, timestampMs)
  }
  return result
}

/**
 * Returns the uptime percentage (0–100) of a buff over the fight duration.
 * Clamps window boundaries to [0, fightDurationMs] before summing.
 * Overlapping windows are merged before computing total active time.
 */
export function getBuffUptime(
  windows: BuffWindow[],
  spellName: string,
  fightDurationMs: number,
): number {
  if (fightDurationMs <= 0) return 0

  const lower = spellName.toLowerCase()
  const relevant = windows.filter((w) => w.spellName.toLowerCase() === lower)
  if (relevant.length === 0) return 0

  // Build clamped [start, end] intervals
  const intervals: [number, number][] = relevant.map((w) => [
    Math.max(0, w.startMs),
    Math.min(fightDurationMs, w.endMs ?? fightDurationMs),
  ])

  // Merge overlapping intervals
  intervals.sort((a, b) => a[0] - b[0])
  let totalMs = 0
  let mergeStart = intervals[0]![0]
  let mergeEnd = intervals[0]![1]

  for (let i = 1; i < intervals.length; i++) {
    const interval = intervals[i]!
    if (interval[0] <= mergeEnd) {
      mergeEnd = Math.max(mergeEnd, interval[1])
    } else {
      totalMs += mergeEnd - mergeStart
      mergeStart = interval[0]
      mergeEnd = interval[1]
    }
  }
  totalMs += mergeEnd - mergeStart

  return (totalMs / fightDurationMs) * 100
}
