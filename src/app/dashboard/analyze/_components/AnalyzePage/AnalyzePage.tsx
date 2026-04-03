'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

import { AnalysisResult } from '../AnalysisResult/AnalysisResult'
import { ClassSelector } from '../ClassSelector/ClassSelector'
import { CLASS_COLORS, WOW_CLASSES } from '../ClassSelector/classSelector.constants'
import { FightContext } from '../FightContext/FightContext'
import { LogInput } from '../LogInput/LogInput'

import { useAnalyze } from './hooks/useAnalyze'

const MAX_LOG_LENGTH = 500_000

const STEPS = ['Select Spec', 'Paste Log', 'Results'] as const
const STEP_INDEX: Record<string, number> = { select: 0, input: 1, analyzing: 1, result: 2 }

const TIPS = [
  'Reading your cast timeline...',
  'Checking cooldown alignment...',
  'Evaluating proc response times...',
  'Comparing against SimulationCraft APL...',
  'Measuring rotational efficiency...',
  'Analysing buff and debuff windows...',
  'Reviewing resource management...',
  'Calculating performance score...',
]

function getSpecLabel(specKey: string | null, heroTalentKey: string | null) {
  for (const cls of WOW_CLASSES) {
    const spec = cls.specs.find((s) => s.key === specKey)
    if (spec !== undefined) {
      const hero = spec.heroTalents.find((h) => h.key === heroTalentKey)
      return { specName: `${cls.name} ${spec.name}`, heroTalentName: hero?.name, classKey: cls.key }
    }
  }
  return { specName: '', heroTalentName: undefined, classKey: null }
}

export function AnalyzePage() {
  const {
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
  } = useAnalyze()
  const { step, selectedSpecKey, selectedHeroTalent, error } = state
  const [tipIndex, setTipIndex] = useState(0)

  useEffect(() => {
    if (step !== 'analyzing') return
    const id = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 3000)
    return () => clearInterval(id)
  }, [step])

  const currentStepIndex = STEP_INDEX[step] ?? 0
  const { specName, heroTalentName, classKey } = getSpecLabel(selectedSpecKey, selectedHeroTalent)
  const classColor = classKey !== null ? CLASS_COLORS[classKey] : undefined
  const canProceedFromSelect = selectedSpecKey !== null

  return (
    <div className="min-h-screen bg-[#0a0e17] print:bg-white print:text-black">
      <style>{`
        @media print {
          nav, header, .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .print-section { page-break-inside: avoid; }
        }
      `}</style>
      {/* Progress bar */}
      <div className="no-print border-b border-[#30363d] bg-[#161b22] px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-center">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all',
                    i < currentStepIndex
                      ? 'bg-[#c8a96e] text-[#0d1117]'
                      : i === currentStepIndex
                        ? 'border-2 border-[#c8a96e] text-[#c8a96e]'
                        : 'border border-[#30363d] text-gray-500',
                  )}
                >
                  {i < currentStepIndex ? '✓' : i + 1}
                </div>
                <span
                  className={cn(
                    'text-sm',
                    i < currentStepIndex
                      ? 'text-[#c8a96e]'
                      : i === currentStepIndex
                        ? 'font-medium text-white'
                        : 'text-gray-500',
                  )}
                >
                  {label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    'mx-4 h-px w-16',
                    i < currentStepIndex ? 'bg-[#c8a96e]' : 'bg-[#30363d]',
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Step: select */}
        {step === 'select' && (
          <div className="flex flex-col gap-6">
            <h1 className="text-2xl font-bold text-white">Select your spec</h1>
            <ClassSelector
              selectedSpecKey={selectedSpecKey}
              selectedHeroTalent={selectedHeroTalent}
              onSpecSelect={handleSpecSelect}
              onHeroTalentSelect={handleHeroTalentSelect}
            />
            <button
              type="button"
              disabled={!canProceedFromSelect}
              onClick={goToInput}
              className={cn(
                'self-start rounded-lg bg-[#c8a96e] px-8 py-3 text-sm font-semibold text-[#0d1117]',
                'hover:bg-[#d4b87a] transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-40',
              )}
            >
              Next: Paste Log →
            </button>
          </div>
        )}

        {/* Step: input */}
        {step === 'input' && (
          <div className="flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {state.inputMode === 'wcl'
                    ? 'Analyse from WarcraftLogs'
                    : 'Paste your combat log'}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {specName !== '' && (
                    <span
                      className="rounded-md border px-2.5 py-1 text-xs font-semibold"
                      style={
                        classColor !== undefined
                          ? {
                              borderColor: `${classColor}50`,
                              color: classColor,
                              backgroundColor: `${classColor}15`,
                            }
                          : undefined
                      }
                    >
                      {specName}
                    </span>
                  )}
                  {heroTalentName !== undefined && (
                    <span className="rounded-md border border-[#c8a96e]/30 bg-[#c8a96e]/10 px-2.5 py-1 text-xs font-medium text-[#c8a96e]">
                      {heroTalentName}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={goToSelect}
                className="text-sm text-gray-500 transition-colors hover:text-gray-300"
              >
                ← Back
              </button>
            </div>
            <FightContext value={state.fightContext} onChange={handleFightContextChange} />
            <LogInput
              onLogReady={handleLogReady}
              disabled={false}
              maxLength={MAX_LOG_LENGTH}
              inputMode={state.inputMode}
              onWclUrl={handleWclUrl}
              wclLoading={state.wclLoading}
              wclError={state.wclError}
              availablePlayers={state.availablePlayers}
              onPlayerSelect={handlePlayerSelect}
              onInputModeChange={handleInputModeChange}
            />
            {error !== null && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </p>
            )}
          </div>
        )}

        {/* Step: analyzing */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center gap-6 py-24 text-center">
            <div className="relative flex items-center justify-center">
              <div className="h-24 w-24 animate-pulse rounded-full bg-[#c8a96e]/20" />
              <div className="absolute h-10 w-10 rounded-full bg-[#c8a96e]/60" />
            </div>
            <div>
              <p className="text-xl font-semibold text-white">Analysing your rotation…</p>
              <p className="mt-3 text-sm text-gray-400 transition-opacity duration-500">
                {TIPS[tipIndex]}
              </p>
            </div>
          </div>
        )}

        {/* Step: result */}
        {step === 'result' && state.result !== null && (
          <div className="flex flex-col gap-6">
            <div className="no-print flex items-center justify-between">
              <h1 className="text-2xl font-bold text-white">Analysis</h1>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex items-center gap-2 rounded-lg border border-[#30363d] px-4 py-2 text-sm text-gray-400 transition-colors hover:border-gray-500 hover:text-white"
                >
                  ↓ Export PDF
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg border border-[#30363d] px-4 py-2 text-sm text-gray-300 transition-colors hover:border-[#c8a96e] hover:text-[#c8a96e]"
                >
                  ↺ New analysis
                </button>
              </div>
            </div>
            <AnalysisResult
              result={state.result}
              specName={specName}
              heroTalentName={heroTalentName}
            />
          </div>
        )}
      </div>
    </div>
  )
}
