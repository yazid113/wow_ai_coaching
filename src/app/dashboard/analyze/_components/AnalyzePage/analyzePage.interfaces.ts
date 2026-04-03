import type { WclTalentEntry } from '@/lib/wcl/wclClient'

import type { AnalysisResultData } from '../AnalysisResult/analysisResult.interfaces'
import type { FightContext } from '../FightContext/fightContext.interfaces'
import type { AvailablePlayer } from '../LogInput/logInput.interfaces'

export type AnalyzeStep = 'select' | 'input' | 'analyzing' | 'result'

export interface AnalyzeState {
  step: AnalyzeStep
  selectedSpecKey: string | null
  selectedHeroTalent: string | null
  fightContext: FightContext
  rawLog: string | null
  fightDuration: number | undefined
  result: AnalysisResultData | null
  error: string | null
  analysisId: string | null
  inputMode: 'paste' | 'wcl'
  wclUrl: string | null
  wclLoading: boolean
  wclError: string | undefined
  availablePlayers: AvailablePlayer[] | undefined
  wclSourceId: number | null
  bossName: string | undefined
  talentTree: WclTalentEntry[] | undefined
}
