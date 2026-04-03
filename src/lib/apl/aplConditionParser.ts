import type { AplCondition, AplConditionType } from './apl.types'

// ─── Pattern Matchers ─────────────────────────────────────────────────────────

const BUFF_UP_RE = /^buff\.(\w+)\.up$/
const BUFF_DOWN_RE = /^buff\.(\w+)\.down$/
const BUFF_STACK_GTE_RE = /^buff\.(\w+)\.stack>=(\d+)$/
const COOLDOWN_RE = /^cooldown\.(\w+)\.ready$/
const RESOURCE_GTE_RE = /^(\w+)>=(\d+)$/
const RESOURCE_LTE_RE = /^(\w+)<=(\d+)$/
const TALENT_RE = /^talent\.(\w+)\.enabled$/
const HERO_TREE_RE = /^hero_tree\.(\w+)$/
const TARGET_COUNT_RE = /^target\.count>=(\d+)$/

// ─── Private Helpers ──────────────────────────────────────────────────────────

function matched(
  type: AplConditionType,
  raw: string,
  subject: string,
  negated: boolean,
  value?: string,
): AplCondition {
  return value !== undefined
    ? { type, raw, subject, value, negated }
    : { type, raw, subject, negated }
}

function parseStripped(stripped: string, original: string, negated: boolean): AplCondition {
  let m: RegExpExecArray | null

  m = BUFF_UP_RE.exec(stripped)
  if (m?.[1] !== undefined) return matched('buff_active', original, m[1], negated)

  m = BUFF_DOWN_RE.exec(stripped)
  if (m?.[1] !== undefined) return matched('buff_missing', original, m[1], negated)

  m = BUFF_STACK_GTE_RE.exec(stripped)
  if (m?.[1] !== undefined && m?.[2] !== undefined) {
    return matched('resource_gte', original, m[1], negated, m[2])
  }

  m = COOLDOWN_RE.exec(stripped)
  if (m?.[1] !== undefined) return matched('cooldown_ready', original, m[1], negated)

  m = TALENT_RE.exec(stripped)
  if (m?.[1] !== undefined) return matched('talent_selected', original, m[1], negated)

  m = HERO_TREE_RE.exec(stripped)
  if (m?.[1] !== undefined) return matched('hero_talent_selected', original, m[1], negated)

  m = TARGET_COUNT_RE.exec(stripped)
  if (m?.[1] !== undefined) {
    return matched('target_count_gte', original, 'target', negated, m[1])
  }

  m = RESOURCE_GTE_RE.exec(stripped)
  if (m?.[1] !== undefined && m?.[2] !== undefined) {
    return matched('resource_gte', original, m[1], negated, m[2])
  }

  m = RESOURCE_LTE_RE.exec(stripped)
  if (m?.[1] !== undefined && m?.[2] !== undefined) {
    return matched('resource_lte', original, m[1], negated, m[2])
  }

  return { type: 'unknown', raw: original, subject: stripped, negated }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Parses a single SimulationCraft condition token into an AplCondition.
 *
 * Handles optional `!` negation prefix. Never throws — unrecognized patterns
 * return `{ type: 'unknown' }` with the raw string preserved.
 */
export function parseCondition(raw: string): AplCondition {
  const trimmed = raw.trim()
  const negated = trimmed.startsWith('!')
  const stripped = negated ? trimmed.slice(1) : trimmed
  return parseStripped(stripped, trimmed, negated)
}

/**
 * Splits a SimC `if=` condition expression on `&` and parses each token.
 *
 * @example
 * parseConditionExpression('buff.heating_up.up&!buff.hot_streak.up')
 * // Returns:
 * // [
 * //   { type: 'buff_active',  raw: 'buff.heating_up.up',   subject: 'heating_up',  negated: false },
 * //   { type: 'buff_active',  raw: '!buff.hot_streak.up',  subject: 'hot_streak',  negated: true  },
 * // ]
 *
 * Returns an empty array for an empty or whitespace-only expression.
 * Never throws.
 */
export function parseConditionExpression(expression: string): AplCondition[] {
  const trimmed = expression.trim()
  if (!trimmed) return []
  return trimmed.split('&').map(parseCondition)
}
