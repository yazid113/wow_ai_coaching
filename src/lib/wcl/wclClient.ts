import { getWclToken } from './wclAuth'
import { buildAllFightsQuery, buildEventsQuery, buildReportMetaQuery } from './wclQueries'

const API_URL = 'https://www.warcraftlogs.com/api/v2/client'
const MAX_PAGES = 10

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WclFight {
  id: number
  name: string
  startTime: number
  endTime: number
}

export interface WclActor {
  id: number
  name: string
  type: string
  subType: string
}

export interface WclTalentEntry {
  id: number
  rank: number
  nodeID: number
}

export interface WclReportMeta {
  fights: WclFight[]
  actors: WclActor[]
  activeSourceIds: number[]
  playerItemLevels: Record<number, number>
  playerTalentTrees: Record<number, WclTalentEntry[]>
  playerSpecIds: Record<number, number>
}

export interface WclRawEvent {
  timestamp: number
  type: string
  sourceID: number
  targetID: number
  abilityGameID: number
  fight: number
  stack?: number
}

export interface WclEventsPage {
  data: WclRawEvent[]
  nextPageTimestamp: number | null
}

// ─── Error ────────────────────────────────────────────────────────────────────

export class WclApiError extends Error {
  readonly status: number | undefined

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'WclApiError'
    this.status = status
  }
}

// ─── Private helper ───────────────────────────────────────────────────────────

async function graphqlRequest(query: string): Promise<unknown> {
  const token = await getWclToken()

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  })

  if (!res.ok) {
    throw new WclApiError(`WCL API error: ${res.status} ${res.statusText}`, res.status)
  }

  const result = (await res.json()) as {
    data?: unknown
    errors?: { message: string }[]
  }

  if (result.errors !== undefined && result.errors.length > 0) {
    throw new WclApiError(`WCL GraphQL: ${result.errors[0]?.message ?? 'unknown error'}`)
  }

  if (result.data === undefined) {
    throw new WclApiError('WCL API returned no data')
  }

  return result.data
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchAllFights(reportCode: string): Promise<WclFight[]> {
  const query = buildAllFightsQuery(reportCode)

  const data = (await graphqlRequest(query)) as {
    reportData: {
      report: { fights: WclFight[] } | null
    }
  }

  const report = data.reportData.report
  if (report === null) {
    throw new WclApiError(`Report "${reportCode}" not found`)
  }

  return report.fights
}

export async function fetchReportMeta(
  reportCode: string,
  fightId: number,
  startTime: number,
  endTime: number,
): Promise<WclReportMeta> {
  const query = buildReportMetaQuery(reportCode, fightId, startTime, endTime)

  const data = (await graphqlRequest(query)) as {
    reportData: {
      report: {
        fights: WclFight[]
        masterData: { actors: WclActor[] }
        events: {
          data: {
            sourceID: number
            ilvl?: number
            talentTree?: WclTalentEntry[]
            specID?: number
          }[]
        }
      } | null
    }
  }

  const report = data.reportData.report
  if (report === null) {
    throw new WclApiError(`Report "${reportCode}" not found`)
  }

  const activeSourceIds = Array.from(new Set(report.events.data.map((e) => e.sourceID)))

  const playerItemLevels: Record<number, number> = {}
  const playerTalentTrees: Record<number, WclTalentEntry[]> = {}
  const playerSpecIds: Record<number, number> = {}
  for (const event of report.events.data) {
    if (event.ilvl !== undefined) {
      playerItemLevels[event.sourceID] = event.ilvl
    }
    if (event.talentTree !== undefined) {
      playerTalentTrees[event.sourceID] = event.talentTree
    }
    if (event.specID !== undefined) {
      playerSpecIds[event.sourceID] = event.specID
    }
  }

  return {
    fights: report.fights,
    actors: report.masterData.actors,
    activeSourceIds,
    playerItemLevels,
    playerTalentTrees,
    playerSpecIds,
  }
}

export async function fetchEvents(
  reportCode: string,
  fightId: number,
  sourceId: number,
  dataType: 'Casts' | 'Buffs',
  startTime: number,
  endTime: number,
  nextPageTimestamp?: number,
): Promise<WclEventsPage> {
  const start = nextPageTimestamp ?? startTime
  const query = buildEventsQuery(reportCode, fightId, sourceId, dataType, start, endTime)

  const data = (await graphqlRequest(query)) as {
    reportData: {
      report: {
        events: WclEventsPage
      }
    }
  }

  return data.reportData.report.events
}

/**
 * Fetches all pages of events for a fight.
 * Note: WCL guarantees nextPageTimestamp stays within
 * the fight window, so endTime is safe to hold constant
 * across pages. If this assumption ever breaks, update
 * to use nextPageTimestamp as both start and end of the
 * next page window.
 */
export async function fetchAllEvents(
  reportCode: string,
  fightId: number,
  sourceId: number,
  dataType: 'Casts' | 'Buffs',
  startTime: number,
  endTime: number,
): Promise<WclRawEvent[]> {
  const all: WclRawEvent[] = []
  let pageTimestamp: number | undefined
  let pages = 0

  while (true) {
    if (pages >= MAX_PAGES) {
      throw new WclApiError(`fetchAllEvents exceeded ${MAX_PAGES} page limit`)
    }

    const page = await fetchEvents(
      reportCode,
      fightId,
      sourceId,
      dataType,
      startTime,
      endTime,
      pageTimestamp,
    )
    all.push(...page.data)
    pages++

    if (page.nextPageTimestamp === null) break
    pageTimestamp = page.nextPageTimestamp
    await new Promise<void>((resolve) => setTimeout(resolve, 200))
  }

  return all
}
