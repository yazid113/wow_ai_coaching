import { z } from 'zod'

// ─── ParsedLog ────────────────────────────────────────────────────────────────

export const CastEventSchema = z.object({
  timestamp: z.string(),
  timestampMs: z.number(),
  spellId: z.string(),
  spellName: z.string(),
  success: z.boolean(),
  targetId: z.string().optional(),
})

export const BuffEventSchema = z.object({
  timestamp: z.string(),
  timestampMs: z.number(),
  type: z.enum(['gained', 'expired', 'refreshed']),
  spellId: z.string(),
  spellName: z.string(),
})

export const ResourceEventSchema = z.object({
  timestamp: z.string(),
  timestampMs: z.number(),
  resourceType: z.string(),
  amount: z.number(),
  total: z.number(),
})

export const ParsedLogSchema = z.object({
  castEvents: z.array(CastEventSchema),
  buffEvents: z.array(BuffEventSchema),
  resourceEvents: z.array(ResourceEventSchema),
  fightDurationMs: z.number(),
  playerName: z.string().optional(),
})

// ─── Grade ────────────────────────────────────────────────────────────────────

export const GradeSchema = z.enum(['S', 'A', 'B', 'C', 'D', 'F'])

export type Grade = z.infer<typeof GradeSchema>

// ─── Severity ─────────────────────────────────────────────────────────────────

export const SeveritySchema = z.enum(['critical', 'moderate', 'minor'])

export type Severity = z.infer<typeof SeveritySchema>

// ─── Error Entry ──────────────────────────────────────────────────────────────

export const AnalysisErrorSchema = z.object({
  /** Deterministic rule ID that produced this error, or empty string for AI-only findings. */
  ruleId: z.string(),
  severity: SeveritySchema,
  /** Short label shown in the UI error list. */
  title: z.string(),
  /** Player-friendly explanation of what went wrong and why it matters. */
  explanation: z.string(),
  /** Formatted timestamp from the combat log, or null when no specific cast is implicated. */
  timestamp: z.string().nullable(),
})

export type AnalysisError = z.infer<typeof AnalysisErrorSchema>

// ─── Full Analysis Response ───────────────────────────────────────────────────

export const AnalysisResponseSchema = z.object({
  /** Overall performance score, 0–100. */
  score: z.number().int().min(0).max(100),
  grade: GradeSchema,
  /** 2–3 sentence plain English overview of the performance. */
  summary: z.string(),
  /** All rotation errors identified during the fight. */
  errors: z.array(AnalysisErrorSchema),
  /** Specific things the player did well. */
  wins: z.array(z.string()),
  /** Single most impactful thing for the player to improve next session. */
  top_focus: z.string(),
})

export type AnalysisResponse = z.infer<typeof AnalysisResponseSchema>
