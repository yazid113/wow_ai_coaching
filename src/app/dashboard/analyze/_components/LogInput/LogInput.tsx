'use client'

import { cn } from '@/lib/utils'

import { useLogInput } from './hooks/useLogInput'
import type { LogInputProps } from './logInput.interfaces'
import { WclPanel } from './WclPanel'

const PLACEHOLDER = `Paste your WoW combat log here.\n\nTo generate a log:\n1. Enable Advanced Combat Logging in-game (System → Network)\n2. Type /combatlog in-game to start recording\n3. Fight your boss — log saves to Logs/WoWCombatLog.txt\n4. Open the file and paste its contents here`

const TABS: { key: 'paste' | 'wcl'; label: string }[] = [
  { key: 'paste', label: 'Paste combat log' },
  { key: 'wcl', label: 'WarcraftLogs URL' },
]

export function LogInput({
  onLogReady,
  disabled,
  maxLength,
  inputMode,
  onWclUrl,
  wclLoading,
  wclError,
  availablePlayers,
  onPlayerSelect,
  onInputModeChange,
}: LogInputProps) {
  const {
    logText,
    fightDuration,
    error,
    isReady,
    handleLogChange,
    handleDurationChange,
    handleClear,
    handleSubmit,
  } = useLogInput({ maxLength, onLogReady })

  const charCount = logText.length
  const isNearLimit = charCount > maxLength * 0.8
  const isAtLimit = charCount >= maxLength

  return (
    <div className="flex flex-col gap-4">
      {/* Tab switcher */}
      <div className="flex gap-0 border-b border-[#30363d]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              onInputModeChange(tab.key)
            }}
            className={cn(
              'px-4 py-2 text-sm font-medium transition-colors',
              inputMode === tab.key
                ? 'border-b-2 border-[#c8a96e] text-[#c8a96e] -mb-px'
                : 'text-gray-400 hover:text-gray-200',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* WCL mode */}
      {inputMode === 'wcl' && (
        <WclPanel
          onWclUrl={onWclUrl}
          loading={wclLoading}
          error={wclError}
          availablePlayers={availablePlayers}
          onPlayerSelect={onPlayerSelect}
          disabled={disabled}
        />
      )}

      {/* Paste mode */}
      {inputMode === 'paste' && (
        <>
          <div className="relative">
            <textarea
              value={logText}
              onChange={handleLogChange}
              disabled={disabled}
              rows={12}
              spellCheck={false}
              placeholder={PLACEHOLDER}
              className={cn(
                'w-full rounded-lg border bg-[#0d1117] p-4',
                'font-mono text-sm text-gray-300 placeholder:font-sans placeholder:text-gray-600',
                'resize-y focus:outline-none transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-50',
                error !== undefined
                  ? 'border-red-500 focus:border-red-400'
                  : 'border-[#30363d] focus:border-[#c8a96e]',
              )}
            />
            {logText.length > 0 && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-2 top-2 rounded px-2 py-0.5 text-xs text-gray-500 transition-colors hover:bg-[#1c2128] hover:text-gray-300"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center justify-between gap-4">
            <span
              className={cn(
                'text-xs tabular-nums',
                isAtLimit ? 'text-red-400' : isNearLimit ? 'text-yellow-400' : 'text-gray-500',
              )}
            >
              {charCount.toLocaleString()} / {maxLength.toLocaleString()}
            </span>
            {isReady && (
              <span className="flex items-center gap-1.5 text-xs font-medium text-[#c8a96e]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#c8a96e]" />
                Ready to analyse
              </span>
            )}
          </div>

          {error !== undefined && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex items-center gap-3">
            <label htmlFor="fight-duration" className="shrink-0 text-sm text-gray-400">
              Fight duration
              <span className="ml-1.5 rounded bg-[#0d1117] px-1.5 py-0.5 text-xs text-gray-500 border border-[#30363d]">
                optional
              </span>
            </label>
            <input
              id="fight-duration"
              type="number"
              min={1}
              value={fightDuration ?? ''}
              onChange={handleDurationChange}
              disabled={disabled}
              placeholder="e.g. 180"
              className={cn(
                'w-28 rounded-lg border border-[#30363d] bg-[#0d1117] px-3 py-2',
                'text-sm text-white placeholder-gray-600',
                'focus:border-[#c8a96e] focus:outline-none transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            />
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isReady || disabled}
            className={cn(
              'self-start rounded-lg bg-[#c8a96e] px-8 py-3 text-sm font-semibold text-[#0d1117]',
              'hover:bg-[#d4b87a] transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-40',
            )}
          >
            Analyse rotation →
          </button>
        </>
      )}
    </div>
  )
}
