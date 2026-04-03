// ─── Condition Classification ─────────────────────────────────────────────────

/** Discriminated category of a parsed APL condition expression. */
export type AplConditionType =
  | 'buff_active'
  | 'buff_missing'
  | 'cooldown_ready'
  | 'resource_gte'
  | 'resource_lte'
  | 'talent_selected'
  | 'hero_talent_selected'
  | 'target_count_gte'
  | 'unknown'

// ─── Condition ────────────────────────────────────────────────────────────────

/**
 * A single parsed condition clause from an APL `if=` expression.
 * Complex compound expressions (e.g. `buff.a.up&cooldown.b.ready`) are split
 * into one AplCondition per clause before parsing.
 */
export interface AplCondition {
  /** Classified type of the condition. */
  type: AplConditionType
  /** Original condition string as it appears in the APL, e.g. "buff.heating_up.up". */
  raw: string
  /** The spell, buff, resource, or talent being tested, e.g. "heating_up". */
  subject: string
  /** Numeric or named threshold for comparisons, e.g. "3" for resource checks. */
  value?: string | undefined
  /** True when the condition is prefixed with ! (logical negation). */
  negated: boolean
}

// ─── Action ───────────────────────────────────────────────────────────────────

/**
 * A single parsed APL action line with its full condition set and
 * position within its list.
 */
export interface AplAction {
  /** SimulationCraft spell key as it appears in the APL, e.g. "fire_blast". */
  spellKey: string
  /** All conditions that must be satisfied for this action to fire. */
  conditions: AplCondition[]
  /** Full original APL line, preserved for debugging and AI prompt context. */
  rawLine: string
  /**
   * 1-based position of this action within its list.
   * Lower values are evaluated first — lower priority number = higher actual priority.
   */
  priority: number
  /** Name of the APL list this action belongs to, e.g. "default" or "cooldowns". */
  listName: string
}

// ─── Parsed APL ───────────────────────────────────────────────────────────────

/**
 * Fully parsed APL for a single spec and optional hero talent tree.
 * All actions are included in a single flat array ordered by (listName, priority).
 */
export interface ParsedApl {
  /** Spec identifier matching BaseSpecDefinition.specKey, e.g. "mage-fire". */
  specKey: string
  /** Hero talent tree this APL applies to, if tree-specific. */
  heroTalentTree?: string
  /** WoW patch version the source .simc file targets, e.g. "11.1". */
  patchVersion: string
  /** All parsed actions across all APL lists, ordered by (listName, priority). */
  actions: AplAction[]
  /** Raw .simc file content, retained for re-parsing and audit. */
  rawContent: string
  /** ISO 8601 timestamp of when this parse was performed. */
  parsedAt: string
  /** URL the .simc file was fetched from, e.g. the SimulationCraft GitHub raw URL. */
  sourceUrl: string
}

// ─── Parse Errors ─────────────────────────────────────────────────────────────

/** A non-fatal issue encountered while parsing a single APL line. */
export interface AplParseError {
  /** The raw line that could not be parsed. */
  line: string
  /** 1-based line number in the source file. */
  lineNumber: number
  /** Human-readable explanation of why parsing failed for this line. */
  reason: string
}

// ─── Parse Result ─────────────────────────────────────────────────────────────

/**
 * Result of a full APL file parse attempt.
 * Parse errors are non-fatal — a result can be successful with warnings.
 */
export interface AplParseResult {
  /** True if parsing produced a usable ParsedApl, even if there were warnings. */
  success: boolean
  /** The parsed APL, present when success is true. */
  parsed?: ParsedApl
  /** Lines that could not be parsed, collected as non-fatal errors. */
  errors: AplParseError[]
  /** Total number of lines that produced warnings or were skipped. */
  warningCount: number
}
