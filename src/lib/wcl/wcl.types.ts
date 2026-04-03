export interface WclFight {
  id: number
  startTime: number
  endTime: number
  name: string
}

export interface WclActor {
  id: number
  name: string
  type: string
}

export interface WclAbility {
  gameID: number
  name: string
}

export interface WclCastEvent {
  timestamp: number
  type: 'cast' | 'begincast'
  sourceID: number
  abilityGameID: number
}

export interface WclBuffEvent {
  timestamp: number
  type: 'applybuff' | 'removebuff' | 'applybuffstack' | 'removebuffstack'
  sourceID: number
  abilityGameID: number
}

export interface WclEventsPage {
  data: unknown[]
  nextPageTimestamp: number | null
}

export interface WclMetadataResponse {
  reportData: {
    report: {
      fights: WclFight[]
      masterData: {
        actors: WclActor[]
        abilities: WclAbility[]
      }
    }
  }
}

export interface WclAllFightsResponse {
  reportData: {
    report: {
      fights: Pick<WclFight, 'id' | 'startTime' | 'endTime'>[]
    }
  }
}

export interface WclEventsResponse {
  reportData: {
    report: {
      events: WclEventsPage
    }
  }
}
