import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { env } from '@/config/env'
import { seedAllSpecKnowledge } from '@/services/knowledgeSeedService'

const RequestBodySchema = z.object({
  force: z.boolean().optional().default(false),
})

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

  const { force } = parsed.data

  try {
    const summary = await seedAllSpecKnowledge(force)

    return NextResponse.json(
      {
        force,
        total: summary.total,
        succeeded: summary.succeeded,
        skipped: summary.skipped,
        failed: summary.failed,
        results: summary.results.map((r) => ({
          specKey: r.specKey,
          heroTalent: r.heroTalent,
          success: r.success,
          ...(r.knowledgeLength >= 0 ? { knowledgeLength: r.knowledgeLength } : { skipped: true }),
          ...(r.error !== undefined ? { error: r.error } : {}),
        })),
      },
      { status: summary.failed === 0 ? 200 : 207 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
