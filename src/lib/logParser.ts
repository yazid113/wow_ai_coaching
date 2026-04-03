import type { BuffEvent, CastEvent } from '@/lib/specRules/types'

import type { LogParseResult, ParseWarning } from './logParser.types'

// ─── Event Type Constants ─────────────────────────────────────────────────────

const EVT_ENCOUNTER_START = 'ENCOUNTER_START'
const EVT_ENCOUNTER_END = 'ENCOUNTER_END'
const EVT_SPELL_CAST_SUCCESS = 'SPELL_CAST_SUCCESS'
const EVT_SPELL_CAST_FAILED = 'SPELL_CAST_FAILED'
const EVT_SPELL_AURA_APPLIED = 'SPELL_AURA_APPLIED'
const EVT_SPELL_AURA_REMOVED = 'SPELL_AURA_REMOVED'
const EVT_SPELL_AURA_REFRESH = 'SPELL_AURA_REFRESH'

// ─── Field Indices ────────────────────────────────────────────────────────────

// After the event type token, CLF fields are 0-indexed:
// 0: sourceGUID  1: sourceName  2-3: sourceFlags
// 4: destGUID    5: destName    6-7: destFlags
// 8: spellId     9: spellName   10: spellSchool
// 11: auraType  (SPELL_AURA_* only — "BUFF" | "DEBUFF")
const F_SOURCE_GUID = 0
const F_SOURCE_NAME = 1
const F_DEST_GUID = 4
const F_SPELL_ID = 8
const F_SPELL_NAME = 9
const F_AURA_TYPE = 11

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Converts the time portion of a CLF timestamp ("M/D HH:MM:SS.mmm") to
 * milliseconds since midnight. Returns null if the format is unrecognised.
 */
function parseClfTimestamp(ts: string): number | null {
  const match = ts.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/)
  if (!match) return null
  const [, hh, mm, ss, ms] = match
  return (
    parseInt(hh ?? '0', 10) * 3_600_000 +
    parseInt(mm ?? '0', 10) * 60_000 +
    parseInt(ss ?? '0', 10) * 1_000 +
    parseInt(ms ?? '0', 10)
  )
}

/** Formats elapsed milliseconds as "M:SS" relative to fight start. */
function formatRelativeTimestamp(elapsedMs: number): string {
  const totalSec = Math.floor(elapsedMs / 1_000)
  const minutes = Math.floor(totalSec / 60)
  const seconds = totalSec % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/** Splits a CLF CSV line into fields, respecting double-quoted values. */
function splitCsvLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes
    } else if (ch === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  fields.push(current)
  return fields
}

// ─── Player GUID Detection ────────────────────────────────────────────────────

interface RawLine {
  lineNumber: number
  timestampMs: number
  eventType: string
  fields: string[]
}

/**
 * Resolves the player's GUID from the raw line list.
 * If playerName is provided, matches the first successful cast by that name.
 * Falls back to the most frequent Player-* GUID found as cast source.
 */
function detectPlayerGuid(lines: RawLine[], playerName?: string): string | undefined {
  if (playerName !== undefined) {
    for (const line of lines) {
      const guid = line.fields[F_SOURCE_GUID] ?? ''
      if (
        line.eventType === EVT_SPELL_CAST_SUCCESS &&
        line.fields[F_SOURCE_NAME] === playerName &&
        guid.startsWith('Player-')
      ) {
        return guid
      }
    }
  }

  const counts = new Map<string, number>()
  for (const line of lines) {
    if (line.eventType === EVT_SPELL_CAST_SUCCESS) {
      const guid = line.fields[F_SOURCE_GUID] ?? ''
      if (guid.startsWith('Player-')) {
        counts.set(guid, (counts.get(guid) ?? 0) + 1)
      }
    }
  }

  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses raw WoW combat log text (CLF format) into a structured ParsedLog.
 *
 * - Fight boundaries come from ENCOUNTER_START / ENCOUNTER_END when present,
 *   falling back to the first and last events in the file.
 * - Only events belonging to the detected player GUID are emitted.
 * - Only BUFF aura events are tracked (DEBUFF auras are skipped).
 * - Timestamps in output are relative to fight start (format: "M:SS").
 */
export function parseLog(raw: string, playerName?: string): LogParseResult {
  const warnings: ParseWarning[] = []
  const rawLines: RawLine[] = []

  // ── Pass 1: tokenise ──────────────────────────────────────────────────────
  const textLines = raw.split('\n')
  for (let i = 0; i < textLines.length; i++) {
    const text = (textLines[i] ?? '').trim()
    if (text === '') continue

    const sepIdx = text.indexOf('  ')
    if (sepIdx === -1) continue

    const timestampMs = parseClfTimestamp(text.slice(0, sepIdx))
    if (timestampMs === null) continue

    const parts = splitCsvLine(text.slice(sepIdx + 2))
    const eventType = parts[0] ?? ''
    rawLines.push({ lineNumber: i + 1, timestampMs, eventType, fields: parts.slice(1) })
  }

  if (rawLines.length === 0) {
    warnings.push({ lineNumber: 0, line: '', reason: 'No parseable CLF lines found' })
    return {
      log: { castEvents: [], buffEvents: [], resourceEvents: [], fightDurationMs: 0 },
      warnings,
    }
  }

  // ── Fight boundaries ──────────────────────────────────────────────────────
  const fightStartMs =
    rawLines.find((l) => l.eventType === EVT_ENCOUNTER_START)?.timestampMs ??
    rawLines[0]!.timestampMs
  const fightEndMs =
    rawLines.findLast((l) => l.eventType === EVT_ENCOUNTER_END)?.timestampMs ??
    rawLines.at(-1)!.timestampMs

  // ── Player GUID ───────────────────────────────────────────────────────────
  const playerGuid = detectPlayerGuid(rawLines, playerName)
  if (playerGuid === undefined) {
    warnings.push({
      lineNumber: 0,
      line: '',
      reason: 'Could not detect player GUID — all casts included',
    })
  }

  const playerNameResolved =
    playerGuid !== undefined
      ? rawLines.find((l) => (l.fields[F_SOURCE_GUID] ?? '') === playerGuid)?.fields[F_SOURCE_NAME]
      : undefined

  // ── Pass 2: extract events ────────────────────────────────────────────────
  const castEvents: CastEvent[] = []
  const buffEvents: BuffEvent[] = []

  for (const { eventType, fields, timestampMs } of rawLines) {
    if (timestampMs < fightStartMs || timestampMs > fightEndMs) continue

    const elapsedMs = timestampMs - fightStartMs
    const timestamp = formatRelativeTimestamp(elapsedMs)
    const sourceGuid = fields[F_SOURCE_GUID] ?? ''
    const destGuid = fields[F_DEST_GUID] ?? ''
    const spellId = fields[F_SPELL_ID] ?? ''
    const spellName = fields[F_SPELL_NAME] ?? ''

    if (eventType === EVT_SPELL_CAST_SUCCESS || eventType === EVT_SPELL_CAST_FAILED) {
      if (playerGuid !== undefined && sourceGuid !== playerGuid) continue
      const cast: CastEvent = {
        timestamp,
        timestampMs: elapsedMs,
        spellId,
        spellName,
        success: eventType === EVT_SPELL_CAST_SUCCESS,
      }
      if (destGuid !== '') cast.targetId = destGuid
      castEvents.push(cast)
      continue
    }

    if (
      eventType === EVT_SPELL_AURA_APPLIED ||
      eventType === EVT_SPELL_AURA_REMOVED ||
      eventType === EVT_SPELL_AURA_REFRESH
    ) {
      if (playerGuid !== undefined && destGuid !== playerGuid) continue
      if ((fields[F_AURA_TYPE] ?? '') !== 'BUFF') continue

      const type: BuffEvent['type'] =
        eventType === EVT_SPELL_AURA_APPLIED
          ? 'gained'
          : eventType === EVT_SPELL_AURA_REMOVED
            ? 'expired'
            : 'refreshed'

      buffEvents.push({ timestamp, timestampMs: elapsedMs, type, spellId, spellName })
    }
  }

  return {
    log: {
      castEvents,
      buffEvents,
      resourceEvents: [],
      fightDurationMs: fightEndMs - fightStartMs,
      ...(playerNameResolved !== undefined ? { playerName: playerNameResolved } : {}),
    },
    warnings,
  }
}
