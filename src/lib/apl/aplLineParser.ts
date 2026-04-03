import type { AplAction, AplParseError, AplParseResult, ParsedApl } from './apl.types'
import { parseConditionExpression } from './aplConditionParser'

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_LIST_NAME = 'default'

// Matches: actions[.list_name][+]=/spell_name[,rest]
// Group 1 — optional list name
// Group 2 — spell name
// Group 3 — optional remainder after first comma (params including if=...)
const ACTION_LINE_RE = /^actions(?:\.(\w+))?\+?=\/(\w+)(?:,(.*))?$/

// Matches: if=<expression> anywhere in params string
const IF_PARAM_RE = /(?:^|,)if=(.+?)(?:,\w+=|$)/

const VARIABLE_PREFIX = 'variable,'
const METADATA_RE = /^\w+=\S/

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses a single raw APL line.
 *
 * Returns:
 * - `action` — populated for valid action lines, null otherwise
 * - `error` — populated for malformed action lines, null otherwise
 * - `newListName` — active list name after processing this line (may be unchanged)
 *
 * Comments, blank lines, and metadata lines return null action and null error.
 * `variable,` lines return null action, null error, and increment warningCount in the caller.
 */
export function parseAplLine(
  line: string,
  lineNumber: number,
  currentListName: string,
): {
  action: AplAction | null
  error: AplParseError | null
  newListName: string
  isWarning: boolean
} {
  const trimmed = line.trim()

  // Blank or comment — silently skip.
  if (!trimmed || trimmed.startsWith('#')) {
    return { action: null, error: null, newListName: currentListName, isWarning: false }
  }

  // Variable line — skip but flag as warning.
  if (trimmed.startsWith(VARIABLE_PREFIX)) {
    return { action: null, error: null, newListName: currentListName, isWarning: true }
  }

  // Metadata line (e.g. spec=fire, talents=...) — silently skip.
  if (!trimmed.startsWith('actions') && METADATA_RE.test(trimmed)) {
    return { action: null, error: null, newListName: currentListName, isWarning: false }
  }

  const match = ACTION_LINE_RE.exec(trimmed)
  if (!match) {
    // Starts with 'actions' but didn't match — malformed action line.
    if (trimmed.startsWith('actions')) {
      return {
        action: null,
        error: {
          line: trimmed,
          lineNumber,
          reason: 'Malformed action line — could not extract spell name',
        },
        newListName: currentListName,
        isWarning: false,
      }
    }
    // Non-action line not matching metadata heuristic — silently skip.
    return { action: null, error: null, newListName: currentListName, isWarning: false }
  }

  const listName = match[1] ?? DEFAULT_LIST_NAME
  const spellKey = match[2]
  const params = match[3] ?? ''

  if (spellKey === undefined || spellKey === '') {
    return {
      action: null,
      error: { line: trimmed, lineNumber, reason: 'Action line matched but spell name is empty' },
      newListName: listName,
      isWarning: false,
    }
  }

  const ifMatch = IF_PARAM_RE.exec(params)
  const conditionExpression = ifMatch?.[1] ?? ''
  const conditions = parseConditionExpression(conditionExpression)

  // priority is assigned by the caller based on action count — placeholder 0 here.
  const action: AplAction = {
    spellKey,
    conditions,
    rawLine: trimmed,
    priority: 0,
    listName,
  }

  return { action, error: null, newListName: listName, isWarning: false }
}

/**
 * Parses the full text content of a SimulationCraft .simc profile into an AplParseResult.
 * Priority is assigned as the 1-based index of valid action lines per list.
 * At least one successfully parsed action is required for success to be true.
 */
export function parseAplContent(
  rawContent: string,
  specKey: string,
  heroTalentTree: string | undefined,
  patchVersion: string,
  sourceUrl: string,
): AplParseResult {
  const lines = rawContent.split('\n')
  const errors: AplParseError[] = []
  const actions: AplAction[] = []
  const listCounters = new Map<string, number>()

  let currentListName = DEFAULT_LIST_NAME
  let warningCount = 0

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? ''
    const result = parseAplLine(raw, i + 1, currentListName)

    currentListName = result.newListName

    if (result.isWarning) {
      warningCount += 1
      continue
    }

    if (result.error !== null) {
      errors.push(result.error)
      continue
    }

    if (result.action === null) continue

    const action = result.action
    const prev = listCounters.get(action.listName) ?? 0
    const priority = prev + 1
    listCounters.set(action.listName, priority)

    actions.push({ ...action, priority })
  }

  if (actions.length === 0) {
    return { success: false, errors, warningCount }
  }

  const parsed: ParsedApl = {
    specKey,
    patchVersion,
    actions,
    rawContent,
    parsedAt: new Date().toISOString(),
    sourceUrl,
    ...(heroTalentTree !== undefined ? { heroTalentTree } : {}),
  }

  return { success: true, parsed, errors, warningCount }
}
