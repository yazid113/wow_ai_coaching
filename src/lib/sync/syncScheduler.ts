/**
 * SYNC SCHEDULER
 *
 * Current state: Manual sync via /api/admin/sync-all
 *
 * Future automation plan:
 *
 * 1. Patch detection (TODO):
 *    - Poll Blizzard /data/wow/journal/instance endpoint
 *    - Compare patch version with stored value
 *    - Trigger full sync when version changes
 *
 * 2. Weekly cron (TODO):
 *    - Run every Tuesday at 10:00 UTC (WoW reset time)
 *    - Use Vercel Cron or similar scheduler
 *    - Call syncAll() to refresh all data
 *
 * 3. SimC APL monitoring (TODO):
 *    - Poll SimC GitHub midnight branch for changes
 *    - Compare commit hash with stored hash
 *    - Re-sync only changed specs
 *
 * 4. Talent tree changes (TODO):
 *    - Blizzard announces talent changes in patch notes
 *    - After patch: sync all talent IDs for changed specs
 *
 * Implementation notes:
 *    - Vercel Cron: add to vercel.json
 *    - Supabase: store last_sync_version, last_apl_commit
 *    - Rate limits: Blizzard API allows 100 req/sec
 */

export async function syncAll(): Promise<void> {
  // TODO: implement automated sync pipeline
  // For now use /api/admin/sync-all manually
  throw new Error('Automated sync not yet implemented')
}
