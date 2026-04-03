import { fetchSpell, fetchSpellMedia, BlizzardApiError } from '@/lib/blizzard/blizzardClient'
import { createServiceClient } from '@/lib/supabase/serviceClient'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SpellSyncResult {
  spellId: number
  name: string
  success: boolean
  error?: string
}

export interface SyncSummary {
  total: number
  succeeded: number
  failed: number
  results: SpellSyncResult[]
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BATCH_SIZE = 10
const BATCH_DELAY_MS = 100
const SPELL_TTL_DAYS = 30

// ─── Private Helpers ──────────────────────────────────────────────────────────

function serializeError(reason: unknown): string {
  if (reason instanceof BlizzardApiError || reason instanceof Error) {
    return reason.message
  }
  return JSON.stringify(reason)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches a single spell from the Blizzard API and upserts it into the
 * spells table. Media is fetched in parallel; a media failure does not
 * prevent the spell row from being written.
 */
export async function syncSpell(spellId: number): Promise<SpellSyncResult> {
  try {
    const [spellResult, mediaResult] = await Promise.allSettled([
      fetchSpell(spellId),
      fetchSpellMedia(spellId),
    ])

    if (spellResult.status === 'rejected') {
      throw new Error(serializeError(spellResult.reason))
    }

    const spell = spellResult.value

    const iconAsset =
      mediaResult.status === 'fulfilled'
        ? mediaResult.value.assets.find((a) => a.key === 'icon')
        : undefined

    const now = new Date()
    const expiresAt = addDays(now, SPELL_TTL_DAYS)

    const supabase = createServiceClient()
    const { error } = await supabase.from('spells').upsert({
      spell_id: spell.id,
      name: spell.name,
      description: spell.description ?? null,
      icon_url: iconAsset?.value ?? null,
      synced_at: now.toISOString(),
      expires_at: expiresAt.toISOString(),
    })

    if (error) {
      throw new Error(error.message)
    }

    return { spellId, name: spell.name, success: true }
  } catch (err) {
    return {
      spellId,
      name: '',
      success: false,
      error: err instanceof Error ? err.message : String(err),
    }
  }
}

/**
 * Syncs a list of spells in batches of 10 with a 100ms delay between
 * batches to stay well within Blizzard's 36,000 req/hour rate limit.
 */
export async function syncSpells(spellIds: number[]): Promise<SyncSummary> {
  const results: SpellSyncResult[] = []

  for (let i = 0; i < spellIds.length; i += BATCH_SIZE) {
    const batch = spellIds.slice(i, i + BATCH_SIZE)
    const batchResults = await Promise.all(batch.map(syncSpell))
    results.push(...batchResults)

    if (i + BATCH_SIZE < spellIds.length) {
      await new Promise<void>((resolve) => setTimeout(resolve, BATCH_DELAY_MS))
    }
  }

  const succeeded = results.filter((r) => r.success).length

  return {
    total: results.length,
    succeeded,
    failed: results.length - succeeded,
    results,
  }
}

/**
 * Deletes spell rows whose expires_at has passed.
 * Required for Blizzard API Terms of Service compliance.
 * Returns the number of deleted rows.
 */
export async function cleanExpiredSpells(): Promise<number> {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('spells')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .select('spell_id')

  if (error) {
    throw new Error(`Failed to clean expired spells: ${error.message}`)
  }

  return data?.length ?? 0
}
