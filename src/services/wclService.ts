import type { ParsedLog } from '@/lib/specRules/types'
import { fetchAllEvents, fetchAllFights, fetchReportMeta, WclApiError } from '@/lib/wcl/wclClient'
import { parseWclEvents, resolveTalentNames, resolveSpellNames } from '@/lib/wcl/wclParser'
import { parseWclUrl } from '@/lib/wcl/wclUrlParser'
import { syncSpells } from '@/services/spellSyncService'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WclFetchInput {
  url: string
  sourceId?: number | undefined
  sourceName?: string | undefined
  specKey?: string | undefined
}

export interface WclFetchResult {
  success: boolean
  parsedLog?: ParsedLog
  reportCode?: string
  fightName?: string
  fightDurationSeconds?: number
  itemLevel?: number | undefined
  talentTree?: Array<{ id: number; rank: number; nodeID: number; name: string }> | undefined
  availablePlayers?: { id: number; name: string; subType: string; specId?: number }[]
  error?: string
  needsPlayerSelection: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WOW_SPEC_IDS: Record<string, number[]> = {
  'mage-fire': [63],
  'mage-frost': [64],
  'mage-arcane': [62],
  'warlock-affliction': [265],
  'warlock-demonology': [266],
  'warlock-destruction': [267],
  'paladin-holy': [65],
  'paladin-protection': [66],
  'paladin-retribution': [70],
  'hunter-beastmastery': [253],
  'hunter-marksmanship': [254],
  'hunter-survival': [255],
  'warrior-arms': [71],
  'warrior-fury': [72],
  'warrior-protection': [73],
  'deathknight-blood': [250],
  'deathknight-frost': [251],
  'deathknight-unholy': [252],
  'druid-balance': [102],
  'druid-feral': [103],
  'druid-guardian': [104],
  'druid-restoration': [105],
  'rogue-assassination': [259],
  'rogue-outlaw': [260],
  'rogue-subtlety': [261],
  'priest-discipline': [256],
  'priest-holy': [257],
  'priest-shadow': [258],
  'shaman-elemental': [262],
  'shaman-enhancement': [263],
  'shaman-restoration': [264],
  'monk-brewmaster': [268],
  'monk-mistweaver': [270],
  'monk-windwalker': [269],
  'demonhunter-havoc': [577],
  'demonhunter-vengeance': [581],
  'demonhunter-devourer': [1473],
  'evoker-devastation': [1467],
  'evoker-preservation': [1468],
  'evoker-augmentation': [1473],
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function errorResult(error: string): WclFetchResult {
  return { success: false, error, needsPlayerSelection: false }
}

const WCL_SUBTYPE_MAP: Record<string, string> = {
  deathknight: 'DeathKnight',
  demonhunter: 'DemonHunter',
  mage: 'Mage',
  warrior: 'Warrior',
  paladin: 'Paladin',
  hunter: 'Hunter',
  rogue: 'Rogue',
  priest: 'Priest',
  shaman: 'Shaman',
  monk: 'Monk',
  druid: 'Druid',
  warlock: 'Warlock',
  evoker: 'Evoker',
}

function getWclSubTypeFromSpecKey(specKey: string): string | null {
  const classSegment = specKey.split('-')[0]
  if (classSegment === undefined) return null
  return WCL_SUBTYPE_MAP[classSegment] ?? null
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchAndParseWclLog(input: WclFetchInput): Promise<WclFetchResult> {
  // 1. Parse URL
  const parsed = parseWclUrl(input.url)
  if (!parsed.valid || parsed.error !== undefined) {
    return errorResult(parsed.error ?? 'Invalid WarcraftLogs URL')
  }
  const { reportCode, fightId: fightIdOrLast } = parsed

  // 2 + 3. Resolve fight and fetch meta
  let fight: Awaited<ReturnType<typeof fetchAllFights>>[number]
  let meta: Awaited<ReturnType<typeof fetchReportMeta>>

  try {
    if (fightIdOrLast === 'last') {
      const allFights = await fetchAllFights(reportCode)
      if (allFights.length === 0) return errorResult('No fights found in report')
      const lastFight = allFights[allFights.length - 1]
      if (lastFight === undefined) return errorResult('No fights found in report')
      fight = lastFight
      meta = await fetchReportMeta(reportCode, fight.id, fight.startTime, fight.endTime)
    } else {
      meta = await fetchReportMeta(reportCode, fightIdOrLast, 0, 0)
      const resolved = meta.fights[0]
      if (resolved === undefined) return errorResult(`Fight ${fightIdOrLast} not found in report`)
      fight = resolved
      meta = await fetchReportMeta(reportCode, fight.id, fight.startTime, fight.endTime)
    }
  } catch (err) {
    const message = err instanceof WclApiError ? err.message : 'Failed to fetch report metadata'
    return errorResult(message)
  }

  // 4. Resolve source actor
  const allPlayerActors = meta.actors.filter(
    (a) => a.type === 'Player' && meta.activeSourceIds.includes(a.id),
  )

  const wclSubType = input.specKey !== undefined ? getWclSubTypeFromSpecKey(input.specKey) : null
  const classFilteredActors =
    wclSubType !== null ? allPlayerActors.filter((a) => a.subType === wclSubType) : allPlayerActors
  const classActors = classFilteredActors.length > 0 ? classFilteredActors : allPlayerActors

  const validSpecIds = WOW_SPEC_IDS[input.specKey ?? '']
  const specFilteredActors =
    validSpecIds !== undefined && validSpecIds.length > 0
      ? classActors.filter((a) => validSpecIds.includes(meta.playerSpecIds[a.id] ?? -1))
      : classActors
  const playerActors = specFilteredActors.length > 0 ? specFilteredActors : classActors

  let sourceId: number

  if (input.sourceId !== undefined) {
    const actor = playerActors.find((a) => a.id === input.sourceId)
    if (actor === undefined) {
      return errorResult(`Player with ID ${input.sourceId} not found in fight`)
    }
    sourceId = actor.id
  } else if (input.sourceName !== undefined) {
    const lower = input.sourceName.toLowerCase()
    const actor = playerActors.find((a) => a.name.toLowerCase() === lower)
    if (actor === undefined) {
      return errorResult(`Player "${input.sourceName}" not found in fight`)
    }
    sourceId = actor.id
  } else {
    return {
      success: false,
      reportCode,
      fightName: fight.name,
      needsPlayerSelection: true,
      availablePlayers: playerActors.map((a) => ({
        id: a.id,
        name: a.name,
        subType: a.subType,
        ...(meta.playerSpecIds[a.id] !== undefined && { specId: meta.playerSpecIds[a.id] }),
      })),
    }
  }

  const itemLevel = meta.playerItemLevels[sourceId]
  const rawTalentTree = meta.playerTalentTrees[sourceId]
  const talentTree =
    rawTalentTree !== undefined ? await resolveTalentNames(rawTalentTree) : undefined

  // 5. Fetch events in parallel
  let castEvents: Awaited<ReturnType<typeof fetchAllEvents>>
  let buffEvents: Awaited<ReturnType<typeof fetchAllEvents>>

  try {
    ;[castEvents, buffEvents] = await Promise.all([
      fetchAllEvents(reportCode, fight.id, sourceId, 'Casts', fight.startTime, fight.endTime),
      fetchAllEvents(reportCode, fight.id, sourceId, 'Buffs', fight.startTime, fight.endTime),
    ])
  } catch (err) {
    const message = err instanceof WclApiError ? err.message : 'Failed to fetch fight events'
    return errorResult(message)
  }

  // 6. Resolve spell names
  const spellIds = Array.from(
    new Set([...castEvents.map((e) => e.abilityGameID), ...buffEvents.map((e) => e.abilityGameID)]),
  )
  const spellNames = await resolveSpellNames(spellIds)

  // 7. Parse events
  const parsedLog = parseWclEvents(
    { fight, actors: meta.actors, castEvents, buffEvents, sourceId },
    spellNames,
  )

  // 8. Fire-and-forget spell sync
  syncSpells(spellIds).catch(() => undefined)

  // 9. Return result
  return {
    success: true,
    parsedLog,
    reportCode,
    fightName: fight.name,
    fightDurationSeconds: Math.round((fight.endTime - fight.startTime) / 1000),
    ...(itemLevel !== undefined && { itemLevel }),
    ...(talentTree !== undefined && { talentTree }),
    needsPlayerSelection: false,
  }
}
