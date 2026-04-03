export const maxDuration = 300
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

import type { ParsedLog } from '@/lib/specRules/types'
import { createClient } from '@/lib/supabase/server'
import { AnalyzeServiceError, analyzeLog } from '@/services/analyzeService'

// ─── Validation ───────────────────────────────────────────────────────────────

const RequestBodySchema = z
  .object({
    rawLog: z.string().min(1).optional(),
    wclParsedLog: z.unknown().optional(),
    specKey: z.string().min(1),
    heroTalentTree: z.string().optional(),
    playerName: z.string().optional(),
    fightDurationSeconds: z.number().positive().optional(),
    fightType: z.enum(['raid', 'mythicplus', 'dungeon', 'targetdummy']).optional(),
    targetCount: z.number().min(1).max(10).optional(),
    itemLevel: z.number().min(400).max(700).optional(),
    bossName: z.string().optional(),
    talentTree: z
      .array(
        z.object({
          id: z.number(),
          rank: z.number(),
          nodeID: z.number(),
        }),
      )
      .optional(),
  })
  .refine((d) => d.rawLog !== undefined || d.wclParsedLog !== undefined, {
    message: 'Either rawLog or wclParsedLog must be provided',
  })

// ─── Error Code → HTTP Status ─────────────────────────────────────────────────

const ERROR_STATUS = {
  SPEC_NOT_FOUND: 422,
  PARSE_ERROR: 502,
  CLAUDE_ERROR: 502,
} as const satisfies Record<AnalyzeServiceError['code'], number>

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '').trim()

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token)

  if (authError !== null || user === null) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = RequestBodySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  try {
    const { wclParsedLog, ...rest } = parsed.data
    let parsedLogOverride
    if (wclParsedLog !== undefined) {
      const rawLog = wclParsedLog
      if (!rawLog || typeof rawLog !== 'object') {
        return NextResponse.json({ error: 'Invalid parsed log format' }, { status: 400 })
      }
      parsedLogOverride = rawLog as ParsedLog
    }
    const result = await analyzeLog({
      ...rest,
      ...(parsedLogOverride !== undefined ? { parsedLogOverride } : {}),
      userId: user.id,
    })
    return NextResponse.json(result, { status: 200 })
  } catch (err) {
    if (err instanceof AnalyzeServiceError) {
      return NextResponse.json(
        { error: err.message, code: err.code },
        { status: ERROR_STATUS[err.code] },
      )
    }
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
