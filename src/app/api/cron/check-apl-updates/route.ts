import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { env } from '@/config/env'
import { checkAndUpdateChangedApls } from '@/services/aplChangeWatcher'

// Allow up to 5 minutes — SHA checks + APL fetches + reseed can take time
export const maxDuration = 300

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Vercel cron authenticates with CRON_SECRET as a Bearer token
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${env.app.syncSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const summary = await checkAndUpdateChangedApls()

    // Log a clear warning if patch version is out of sync
    if (summary.patchVersionMismatch) {
      console.warn(
        `[CronJob] PATCH VERSION MISMATCH — SimC: ${summary.simcPatchVersion} App: ${summary.appPatchVersion}. ` +
          `Update PATCH_VERSION env var to ${summary.simcPatchVersion}, run /api/admin/seed-knowledge { force: true }, then redeploy.`,
      )
    }

    if (summary.updated > 0) {
      console.log(
        `[CronJob] ${summary.updated} spec(s) updated: ${summary.results
          .filter((r) => r.status === 'updated')
          .map((r) => r.specKey)
          .join(', ')}`,
      )
    }

    if (summary.failed > 0) {
      console.error(
        `[CronJob] ${summary.failed} spec(s) failed: ${summary.results
          .filter((r) => r.status === 'failed')
          .map((r) => `${r.specKey}: ${r.error}`)
          .join(' | ')}`,
      )
    }

    return NextResponse.json(
      {
        checkedAt: summary.checkedAt,
        patchVersionMismatch: summary.patchVersionMismatch,
        ...(summary.patchVersionMismatch && {
          warning: `SimC is on ${summary.simcPatchVersion}, app is on ${summary.appPatchVersion} — manual intervention required`,
        }),
        total: summary.total,
        unchanged: summary.unchanged,
        updated: summary.updated,
        failed: summary.failed,
        skipped: summary.skipped,
        updatedSpecs: summary.results.filter((r) => r.status === 'updated').map((r) => r.specKey),
        failedSpecs: summary.results
          .filter((r) => r.status === 'failed')
          .map((r) => ({ specKey: r.specKey, error: r.error })),
      },
      { status: summary.failed > 0 ? 207 : 200 },
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    console.error('[CronJob] Fatal error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
