import { createServiceClient } from '@/lib/supabase/serviceClient'

import { syncSpells } from './spellSyncService'

/**
 * Syncs any talent spell IDs from the provided talent tree that are not yet
 * in the spells cache. Non-fatal — failures are silently swallowed.
 */
export async function syncTalentSpells(
  talentTree: Array<{ id: number; rank: number; nodeID: number; name?: string }>,
): Promise<void> {
  if (talentTree.length === 0) return
  try {
    const talentIds = talentTree.map((t) => t.id)
    const supabase = createServiceClient()
    const { data: existing } = await supabase
      .from('spells')
      .select('spell_id')
      .in('spell_id', talentIds)
    const knownIds = new Set((existing ?? []).map((s: { spell_id: number }) => s.spell_id))
    const missingIds = talentIds.filter((id) => !knownIds.has(id))
    if (missingIds.length > 0) {
      await syncSpells(missingIds)
    }
  } catch {
    // non-fatal — spell cache miss does not affect analysis result
  }
}
