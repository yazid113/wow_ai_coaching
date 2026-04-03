import { z } from 'zod'

// ─── Condition ────────────────────────────────────────────────────────────────

export const AplConditionTypeSchema = z.enum([
  'buff_active',
  'buff_missing',
  'cooldown_ready',
  'resource_gte',
  'resource_lte',
  'talent_selected',
  'hero_talent_selected',
  'target_count_gte',
  'unknown',
])

export const AplConditionSchema = z.object({
  type: AplConditionTypeSchema,
  raw: z.string(),
  subject: z.string(),
  value: z.string().optional(),
  negated: z.boolean(),
})

// ─── Action ───────────────────────────────────────────────────────────────────

export const AplActionSchema = z.object({
  spellKey: z.string(),
  conditions: z.array(AplConditionSchema),
  rawLine: z.string(),
  priority: z.number().int().positive(),
  listName: z.string(),
})

// ─── Parsed APL ───────────────────────────────────────────────────────────────

export const ParsedAplSchema = z.object({
  specKey: z.string(),
  heroTalentTree: z.string().optional(),
  patchVersion: z.string(),
  actions: z.array(AplActionSchema),
  rawContent: z.string(),
  parsedAt: z.string(),
  sourceUrl: z.string(),
})
