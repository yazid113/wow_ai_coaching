/** How impactful a rule violation is on player performance. */
export type Severity = 'critical' | 'moderate' | 'minor'

/** All Hero Talent trees available in the current patch. */
export type HeroTalentTree =
  | 'sunfury'
  | 'spellslinger'
  | 'herald-of-the-sun'
  | 'lightsmith'
  | 'frostfire'
  | 'spellfrost'
  | 'mountain-thane'
  | 'colossus'
  | 'slayer'
  | 'rider-of-the-apocalypse'
  | 'deathbringer'
  | 'san-layn'
  | 'elunes-chosen'
  | 'keeper-of-the-grove'
  | 'druid-of-the-claw'
  | 'pack-leader'
  | 'dark-ranger'
  | 'sentinel'
  | 'moon-harvester'
  | 'trickster'
  | 'deathstalker'
  | 'fatebound'
  | 'wildstalker'
  | 'diabolist'
  | 'hellcaller'
  | 'soul-harvester'
  | 'archon'
  | 'oracle'
  | 'voidweaver'
  | 'totemic'
  | 'stormbringer'
  | 'farseer'
  | 'dance-of-chi-ji'
  | 'conduit-of-the-celestials'
  | 'master-of-harmony'
  | 'scalecommander'
  | 'flameshaper'
  | 'tensors-loupe'
  | 'aldrachi-reaver'
  | 'fel-scarred'
  | 'annihilator'
  | 'void-scarred'

/** A single spell cast recorded in the combat log. */
export interface CastEvent {
  timestamp: string
  timestampMs: number
  spellId: string
  spellName: string
  success: boolean
  targetId?: string
}

/** A buff or debuff state change recorded in the combat log. */
export interface BuffEvent {
  timestamp: string
  timestampMs: number
  type: 'gained' | 'expired' | 'refreshed'
  spellId: string
  spellName: string
}

/** A resource change (mana, rage, energy, etc.) recorded in the combat log. */
export interface ResourceEvent {
  timestamp: string
  timestampMs: number
  resourceType: string
  amount: number
  total: number
}

/** The structured, parsed representation of a WoW combat log for one fight. */
export interface ParsedLog {
  castEvents: CastEvent[]
  buffEvents: BuffEvent[]
  resourceEvents: ResourceEvent[]
  fightDurationMs: number
  playerName?: string | undefined
}

/** A single rule violation instance found during log analysis. */
export interface DetectedError {
  ruleId: string
  timestamp?: string
  context: string
}

/** A single analyzable rotation rule with its detection logic. */
export interface SpecRule {
  id: string
  name: string
  severity: Severity
  description: string
  whyItMatters: string
  howToFix: string
  detect: (log: ParsedLog) => DetectedError[]
}

/** The canonical spec definition covering rules that apply regardless of Hero Talent tree. */
export interface BaseSpecDefinition {
  specKey: string
  className: string
  specName: string
  patchVersion: string
  supportedHeroTalents: HeroTalentTree[]
  rotationSummary: string
  rules: SpecRule[]
  commonMistakes: string[]
  /** Maps human-readable spell names to their numeric spell IDs. */
  spellIds: Record<string, string>
}

/** Modifications applied on top of a BaseSpecDefinition for a specific Hero Talent tree. */
export interface HeroTalentOverlay {
  heroTalentTree: HeroTalentTree
  displayName: string
  /** Appended to the base rotationSummary when building the resolved definition. */
  additionalContext: string
  additionalRules: SpecRule[]
  /** IDs of base rules that no longer apply when this Hero Talent tree is active. */
  removedRuleIds: string[]
  additionalMistakes: string[]
  /** Tree-specific spell IDs merged into the base spellIds map. */
  spellIds: Record<string, string>
}

/**
 * The fully composed spec definition consumed by all downstream code.
 * Always produced by compose(base, overlay) — never constructed manually.
 */
export interface ResolvedSpecDefinition {
  specKey: string
  className: string
  specName: string
  patchVersion: string
  heroTalentTree?: HeroTalentTree
  /** Human-readable label, e.g. "Fire Mage — Sunfury". */
  displayName: string
  /** Merged rotation summary (base + overlay additionalContext). */
  rotationSummary: string
  /** Base rules minus removedRuleIds, plus overlay additionalRules. */
  rules: SpecRule[]
  /** Merged common mistakes from base and overlay. */
  commonMistakes: string[]
  /** Merged spell ID map (overlay values override base on collision). */
  spellIds: Record<string, string>
}
