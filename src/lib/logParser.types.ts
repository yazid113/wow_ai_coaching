import type { ParsedLog } from '@/lib/specRules/types'

// ─── Parse Warning ────────────────────────────────────────────────────────────

/** A non-fatal issue encountered while parsing a combat log line. */
export interface ParseWarning {
  lineNumber: number
  /** Raw text of the line that triggered the warning. */
  line: string
  reason: string
}

// ─── Parse Result ─────────────────────────────────────────────────────────────

/** Result returned by parseLog. Warnings are non-fatal — log is always populated. */
export interface LogParseResult {
  log: ParsedLog
  warnings: ParseWarning[]
}
