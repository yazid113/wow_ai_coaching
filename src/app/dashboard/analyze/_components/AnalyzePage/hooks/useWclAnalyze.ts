'use client'

import { useCallback, useEffect, useRef } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import type { ParsedLog } from '@/lib/specRules/types'
import { createClient } from '@/lib/supabase/client'
import type { WclTalentEntry } from '@/lib/wcl/wclClient'

import type { AvailablePlayer } from '../../LogInput/logInput.interfaces'
import type { AnalyzeState } from '../analyzePage.interfaces'

interface WclParseResponse {
  needsPlayerSelection?: boolean
  availablePlayers?: AvailablePlayer[]
  parsedLog?: ParsedLog
  fightDurationSeconds?: number
  fightName?: string
  itemLevel?: number
  talentTree?: WclTalentEntry[]
  detectedFightType?: 'raid' | 'mythicplus' | 'dungeon' | 'targetdummy'
  detectedTargetCount?: number
  error?: string
}

export type SubmitAnalysis = (
  specKey: string,
  heroTalentTree: string | null,
  logSource: { rawLog: string; duration?: number } | { parsedLog: ParsedLog; duration?: number },
) => Promise<void>

async function getToken(): Promise<string | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.access_token ?? null
}

export function useWclAnalyze(
  state: AnalyzeState,
  setState: Dispatch<SetStateAction<AnalyzeState>>,
  submitAnalysis: SubmitAnalysis,
) {
  const { selectedSpecKey, selectedHeroTalent } = state

  const selectedSpecKeyRef = useRef(selectedSpecKey)
  useEffect(() => {
    selectedSpecKeyRef.current = selectedSpecKey
  }, [selectedSpecKey])

  const handleWclParsed = useCallback(
    (parsed: WclParseResponse, url: string, sourceId: number | null) => {
      if (parsed.error !== undefined) {
        setState((prev) => ({ ...prev, wclLoading: false, wclError: parsed.error }))
        return
      }
      if (parsed.needsPlayerSelection === true) {
        setState((prev) => ({
          ...prev,
          wclLoading: false,
          wclUrl: url,
          availablePlayers: parsed.availablePlayers,
        }))
        return
      }
      if (parsed.parsedLog !== undefined && selectedSpecKey !== null) {
        setState((prev) => ({
          ...prev,
          wclLoading: false,
          wclSourceId: sourceId,
          bossName: parsed.fightName,
          ...(parsed.talentTree !== undefined && { talentTree: parsed.talentTree }),
          fightContext: {
            ...prev.fightContext,
            ...(parsed.itemLevel !== undefined && { itemLevel: parsed.itemLevel }),
            ...(parsed.detectedFightType !== undefined && { fightType: parsed.detectedFightType }),
            ...(parsed.detectedTargetCount !== undefined && {
              targetCount: parsed.detectedTargetCount,
            }),
          },
        }))
        submitAnalysis(selectedSpecKey, selectedHeroTalent, {
          parsedLog: parsed.parsedLog as ParsedLog,
          ...(parsed.fightDurationSeconds !== undefined && {
            duration: parsed.fightDurationSeconds,
          }),
        })
      } else {
        setState((prev) => ({
          ...prev,
          wclLoading: false,
          wclError:
            selectedSpecKey === null
              ? 'Please select a spec before fetching a log'
              : 'No log data returned',
        }))
      }
    },
    [selectedSpecKey, selectedHeroTalent, submitAnalysis, setState],
  )

  const handleWclUrl = useCallback(
    async (url: string) => {
      const token = await getToken()
      if (token === null) {
        setState((prev) => ({ ...prev, wclError: 'Session expired.' }))
        return
      }
      setState((prev) => ({
        ...prev,
        wclLoading: true,
        wclError: undefined,
        wclUrl: url,
        availablePlayers: undefined,
      }))
      try {
        const body: Record<string, unknown> = { url }
        if (selectedSpecKeyRef.current !== null) body['specKey'] = selectedSpecKeyRef.current
        const res = await fetch('/api/wcl/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        })
        const data = (await res.json()) as WclParseResponse
        handleWclParsed(
          res.ok ? data : { error: data.error ?? `Request failed (${res.status})` },
          url,
          null,
        )
      } catch {
        setState((prev) => ({
          ...prev,
          wclLoading: false,
          wclError: 'Network error — please try again.',
        }))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [handleWclParsed],
  )

  const handlePlayerSelect = useCallback(
    async (playerId: number) => {
      const token = await getToken()
      if (token === null) {
        setState((prev) => ({ ...prev, wclError: 'Session expired.' }))
        return
      }
      const url = state.wclUrl
      if (url === null) return
      setState((prev) => ({ ...prev, wclLoading: true, wclError: undefined }))
      try {
        const body: Record<string, unknown> = { url, sourceId: playerId }
        if (selectedSpecKeyRef.current !== null) body['specKey'] = selectedSpecKeyRef.current
        const res = await fetch('/api/wcl/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        })
        const data = (await res.json()) as WclParseResponse
        handleWclParsed(
          res.ok ? data : { error: data.error ?? `Request failed (${res.status})` },
          url,
          playerId,
        )
      } catch {
        setState((prev) => ({
          ...prev,
          wclLoading: false,
          wclError: 'Network error — please try again.',
        }))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.wclUrl, handleWclParsed],
  )

  return { handleWclUrl, handlePlayerSelect }
}
