import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { env } from '@/config/env'
import type { AplAction } from '@/lib/apl/apl.types'
import { createServiceClient } from '@/lib/supabase/serviceClient'
import { syncAllSpecs } from '@/services/aplSyncService'
import { syncSpells } from '@/services/spellSyncService'

// ─── Validation ───────────────────────────────────────────────────────────────

const RequestBodySchema = z.object({
  patchVersion: z.string().min(1),
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

  const { patchVersion } = parsed.data

  try {
    // Step 1 — sync all APLs
    const aplSummary = await syncAllSpecs(patchVersion)

    // Step 2 — sync numeric spell IDs found in stored APL actions
    // APL spellKeys are SimC names (e.g. "fire_blast"), not numeric IDs.
    // This step catches any edge-case numeric keys present in the raw APL.
    const supabase = createServiceClient()
    const { data: rotationRows } = await supabase.from('spec_rotations').select('actions')

    const numericSpellIds = Array.from(
      new Set(
        (rotationRows ?? [])
          .flatMap((row: { actions: AplAction[] }) => row.actions)
          .map((a: AplAction) => a.spellKey)
          .filter((key: string) => /^\d+$/.test(key))
          .map((key: string) => Number(key)),
      ),
    )

    let spellSyncCount = 0
    if (numericSpellIds.length > 0) {
      await syncSpells(numericSpellIds)
      spellSyncCount = numericSpellIds.length
    }

    return NextResponse.json(
      {
        patchVersion,
        apl: {
          total: aplSummary.total,
          succeeded: aplSummary.succeeded,
          failed: aplSummary.failed,
        },
        spells: { synced: spellSyncCount },
        results: aplSummary.results,
      },
      { status: aplSummary.failed === 0 ? 200 : 207 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
