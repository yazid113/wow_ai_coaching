import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { env } from '@/config/env'
import { syncSpells } from '@/services/spellSyncService'

// ─── Validation ───────────────────────────────────────────────────────────────

const RequestBodySchema = z.object({
  spellIds: z.array(z.number().int().positive()).min(1).max(100),
})

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  const secret = request.headers.get('x-sync-secret')
  if (!secret || secret !== env.app.syncSecret) {
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
    const summary = await syncSpells(parsed.data.spellIds)
    let status: 200 | 207 | 502
    if (summary.failed === 0) status = 200
    else if (summary.succeeded === 0) status = 502
    else status = 207
    return NextResponse.json(summary, { status })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
