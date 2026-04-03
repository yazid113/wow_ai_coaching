'use client'

import { useCallback, useState } from 'react'

import type { ParsedLog } from '@/lib/specRules/types'
import { createClient } from '@/lib/supabase/client'

import type { AnalysisResultData } from '../../AnalysisResult/analysisResult.interfaces'
import type { FightContext } from '../../FightContext/fightContext.interfaces'
import { DEFAULT_FIGHT_CONTEXT } from '../../FightContext/fightContext.interfaces'
import type { AnalyzeState } from '../analyzePage.interfaces'

import { useWclAnalyze } from './useWclAnalyze'

const INITIAL_STATE: AnalyzeState = {
  step: 'select',
  selectedSpecKey: null,
  selectedHeroTalent: null,
  fightContext: DEFAULT_FIGHT_CONTEXT,
  rawLog: null,
  fightDuration: undefined,
  result: null,
  error: null,
  analysisId: null,
  inputMode: 'paste',
  wclUrl: null,
  wclLoading: false,
  wclError: undefined,
  availablePlayers: undefined,
  wclSourceId: null,
  bossName: undefined,
  talentTree: undefined,
}

interface ApiResponse {
  analysisId?: string
  score: number
  grade: string
  summary: string
  errors: AnalysisResultData['errors']
  wins: string[]
  top_focus: string
  error?: string
}

export function useAnalyze() {
  const [state, setState] = useState<AnalyzeState>(INITIAL_STATE)

  const handleSpecSelect = (specKey: string) => {
    setState((prev) => ({ ...prev, selectedSpecKey: specKey, step: 'select' }))
  }

  const handleHeroTalentSelect = (tree: string) => {
    setState((prev) => ({ ...prev, selectedHeroTalent: tree }))
  }

  const handleReset = () => {
    setState(INITIAL_STATE)
  }
  const goToInput = () => {
    setState((prev) => ({ ...prev, step: 'input' }))
  }
  const goToSelect = () => {
    setState((prev) => ({ ...prev, step: 'select', result: null, error: null }))
  }

  const handleInputModeChange = (mode: 'paste' | 'wcl') => {
    setState((prev) => ({
      ...prev,
      inputMode: mode,
      wclError: undefined,
      availablePlayers: undefined,
    }))
  }

  const handleFightContextChange = (ctx: FightContext) => {
    setState((prev) => ({ ...prev, fightContext: ctx }))
  }

  const submitAnalysis = useCallback(
    async (
      specKey: string,
      heroTalentTree: string | null,
      logSource:
        | { rawLog: string; duration?: number }
        | { parsedLog: ParsedLog; duration?: number },
    ) => {
      const duration = logSource.duration
      const rawLog = 'rawLog' in logSource ? logSource.rawLog : ''
      setState((prev) => ({
        ...prev,
        step: 'analyzing',
        error: null,
        rawLog,
        fightDuration: duration,
      }))

      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session === null) {
        setState((prev) => ({
          ...prev,
          step: 'input',
          error: 'Session expired. Please sign in again.',
        }))
        return
      }

      const { fightContext } = state
      const body: Record<string, unknown> = {
        specKey,
        fightType: fightContext.fightType,
        targetCount: fightContext.targetCount,
      }
      if (fightContext.itemLevel !== undefined) body['itemLevel'] = fightContext.itemLevel
      if (state.bossName !== undefined) body['bossName'] = state.bossName
      if (state.talentTree !== undefined) body['talentTree'] = state.talentTree
      if (heroTalentTree !== null) body['heroTalentTree'] = heroTalentTree
      if ('parsedLog' in logSource) {
        body['wclParsedLog'] = logSource.parsedLog
      } else {
        body['rawLog'] = logSource.rawLog
        if (duration !== undefined) body['fightDurationSeconds'] = duration
      }

      let response: Response
      try {
        response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(body),
        })
      } catch {
        setState((prev) => ({ ...prev, step: 'input', error: 'Network error — please try again.' }))
        return
      }

      const data = (await response.json()) as ApiResponse
      if (!response.ok) {
        const msg =
          typeof data.error === 'string' ? data.error : `Request failed (${response.status})`
        setState((prev) => ({ ...prev, step: 'input', error: msg }))
        return
      }

      setState((prev) => ({
        ...prev,
        step: 'result',
        result: {
          score: data.score,
          grade: data.grade as AnalysisResultData['grade'],
          summary: data.summary,
          errors: data.errors,
          wins: data.wins,
          top_focus: data.top_focus,
        },
        analysisId: data.analysisId ?? null,
      }))
    },
    [state],
  )

  const { selectedSpecKey, selectedHeroTalent } = state

  const handleLogReady = useCallback(
    (log: string, duration?: number) => {
      if (selectedSpecKey === null) return
      submitAnalysis(selectedSpecKey, selectedHeroTalent, {
        rawLog: log,
        ...(duration !== undefined && { duration }),
      })
    },
    [selectedSpecKey, selectedHeroTalent, submitAnalysis],
  )

  const { handleWclUrl, handlePlayerSelect } = useWclAnalyze(state, setState, submitAnalysis)

  return {
    state,
    handleSpecSelect,
    handleHeroTalentSelect,
    handleFightContextChange,
    handleLogReady,
    handleReset,
    goToInput,
    goToSelect,
    handleInputModeChange,
    handleWclUrl,
    handlePlayerSelect,
  }
}
