// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * A single parsed APL action line with its priority within its list.
 * priority is 1-based, reflecting SimC's top-down evaluation order.
 */
export interface AplAction {
  priority: number
  action: string
  condition?: string | undefined
  rawLine: string
}

/**
 * A named APL list (e.g. 'default', 'cooldowns', 'precombat').
 * 'default' corresponds to bare `actions=` lines with no list qualifier.
 */
export interface AplList {
  name: string
  actions: AplAction[]
}

export interface ParsedApl {
  lists: AplList[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Matches: actions[.list_name][+]=/ action_name[,params...]
 * Group 1 — optional list name (undefined → 'default')
 * Group 2 — everything after the = and optional leading slash
 */
const APL_LINE_RE = /^actions(?:\.(\w+))?\+?=\/?(.+)$/

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses the full text content of a SimulationCraft .simc profile file.
 * Returns all APL lists found, preserving declaration order within each list.
 * Comment lines (starting with #) and non-APL lines are silently ignored.
 *
 * The `if=` condition is captured as-is from the raw line. Conditions may
 * contain commas (e.g. in min(a,b) expressions) so no further splitting
 * is attempted — the full expression is stored for AI analysis.
 */
export function parseAplFile(content: string): ParsedApl {
  const listMap = new Map<string, AplAction[]>()
  const listCounters = new Map<string, number>()

  for (const rawLine of content.split('\n')) {
    const trimmed = rawLine.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const match = APL_LINE_RE.exec(trimmed)
    if (!match) continue

    const listName = match[1] ?? 'default'
    const actionPart = match[2] ?? ''
    if (!actionPart) continue

    const priority = (listCounters.get(listName) ?? 0) + 1
    listCounters.set(listName, priority)

    const commaIdx = actionPart.indexOf(',')
    const action = commaIdx === -1 ? actionPart : actionPart.slice(0, commaIdx)
    if (!action) continue

    const params = commaIdx === -1 ? '' : actionPart.slice(commaIdx + 1)
    const ifIdx = params.indexOf('if=')
    const condition = ifIdx !== -1 ? params.slice(ifIdx + 3) : undefined

    const existing = listMap.get(listName) ?? []
    existing.push({ priority, action, condition, rawLine: trimmed })
    listMap.set(listName, existing)
  }

  const lists: AplList[] = []
  for (const [name, actions] of Array.from(listMap)) {
    lists.push({ name, actions })
  }

  return { lists }
}
