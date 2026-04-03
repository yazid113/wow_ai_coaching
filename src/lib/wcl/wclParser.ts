import type { BuffEvent, CastEvent, ParsedLog } from '@/lib/specRules/types'
import { createServiceClient } from '@/lib/supabase/serviceClient'
import { formatTimestamp } from '@/lib/utils'

import type { WclActor, WclFight, WclRawEvent } from './wclClient'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WclParseInput {
  fight: WclFight
  actors: WclActor[]
  castEvents: WclRawEvent[]
  buffEvents: WclRawEvent[]
  sourceId: number
}

// ─── Buff type map ────────────────────────────────────────────────────────────

const BUFF_TYPE_MAP: Record<string, BuffEvent['type'] | null> = {
  applybuff: 'gained',
  applybuffstack: 'gained',
  removebuff: 'expired',
  removebuffstack: 'expired',
  refreshbuff: 'refreshed',
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function resolveSpellNames(spellIds: number[]): Promise<Record<number, string>> {
  if (spellIds.length === 0) return {}

  const supabase = createServiceClient()

  const { data } = await supabase.from('spells').select('id, name').in('id', spellIds)

  const map: Record<number, string> = {}

  if (data !== null) {
    for (const row of data as { id: number; name: string }[]) {
      map[row.id] = row.name
    }
  }

  for (const id of spellIds) {
    if (map[id] === undefined) {
      map[id] = String(id)
    }
  }

  return map
}

export function parseWclEvents(
  input: WclParseInput,
  spellNames: Record<number, string>,
): ParsedLog {
  const { fight, actors, castEvents, buffEvents, sourceId } = input
  const fightDurationMs = fight.endTime - fight.startTime

  const playerName = actors.find((a) => a.id === sourceId)?.name

  const parsedCasts: CastEvent[] = castEvents
    .filter((e) => e.sourceID === sourceId && e.type === 'cast')
    .map((e) => {
      const timestampMs = e.timestamp - fight.startTime
      return {
        timestamp: formatTimestamp(timestampMs),
        timestampMs,
        spellId: String(e.abilityGameID),
        spellName: spellNames[e.abilityGameID] ?? String(e.abilityGameID),
        success: true,
      }
    })

  const parsedBuffs: BuffEvent[] = buffEvents
    .filter((e) => e.targetID === sourceId)
    .flatMap((e) => {
      const buffType = BUFF_TYPE_MAP[e.type]
      if (buffType === null || buffType === undefined) return []
      const timestampMs = e.timestamp - fight.startTime
      return [
        {
          timestamp: formatTimestamp(timestampMs),
          timestampMs,
          type: buffType,
          spellId: String(e.abilityGameID),
          spellName: spellNames[e.abilityGameID] ?? String(e.abilityGameID),
        },
      ]
    })

  return {
    castEvents: parsedCasts,
    buffEvents: parsedBuffs,
    resourceEvents: [],
    fightDurationMs,
    playerName,
  }
}

export async function resolveTalentNames(
  talentTree: Array<{ id: number; rank: number; nodeID: number }>,
): Promise<Array<{ id: number; rank: number; nodeID: number; name: string }>> {
  const uniqueIds = Array.from(new Set(talentTree.map((t) => t.id)))
  const supabase = createServiceClient()
  const { data } = await supabase.from('spells').select('spell_id, name').in('spell_id', uniqueIds)

  const nameMap: Record<number, string> = {}
  if (data !== null) {
    for (const row of data as { spell_id: number; name: string }[]) {
      nameMap[row.spell_id] = row.name
    }
  }

  return talentTree.map((t) => ({
    ...t,
    name: nameMap[t.id] ?? `Unknown (ID: ${t.id})`,
  }))
}
