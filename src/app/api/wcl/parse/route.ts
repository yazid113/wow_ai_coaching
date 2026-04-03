import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

import { createClient } from '@/lib/supabase/server'
import { fetchAndParseWclLog } from '@/services/wclService'

// ─── Validation ───────────────────────────────────────────────────────────────

const RequestBodySchema = z.object({
  url: z.string().min(1),
  sourceId: z.number().optional(),
  sourceName: z.string().optional(),
  specKey: z.string().optional(),
})

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

  const normalizedUrl = parsed.data.url.startsWith('http')
    ? parsed.data.url
    : `https://${parsed.data.url}`

  const result = await fetchAndParseWclLog({
    url: normalizedUrl,
    ...(parsed.data.sourceId !== undefined && { sourceId: parsed.data.sourceId }),
    ...(parsed.data.sourceName !== undefined && { sourceName: parsed.data.sourceName }),
    ...(parsed.data.specKey !== undefined && { specKey: parsed.data.specKey }),
  })

  if (result.needsPlayerSelection) {
    return NextResponse.json(
      { needsPlayerSelection: true, availablePlayers: result.availablePlayers },
      { status: 200 },
    )
  }

  if (!result.success || result.error !== undefined) {
    return NextResponse.json(
      { error: result.error ?? 'Failed to parse WCL report' },
      { status: 422 },
    )
  }

  return NextResponse.json(
    {
      parsedLog: result.parsedLog,
      fightName: result.fightName,
      fightDurationSeconds: result.fightDurationSeconds,
      reportCode: result.reportCode,
      ...(result.itemLevel !== undefined && { itemLevel: result.itemLevel }),
      ...(result.talentTree !== undefined && { talentTree: result.talentTree }),
    },
    { status: 200 },
  )
}
