'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

import type { AvailablePlayer } from './logInput.interfaces'

interface WclPanelProps {
  onWclUrl: (url: string) => void
  loading: boolean
  error: string | undefined
  availablePlayers: AvailablePlayer[] | undefined
  onPlayerSelect: (playerId: number) => void
  disabled: boolean
}

export function WclPanel({
  onWclUrl,
  loading,
  error,
  availablePlayers,
  onPlayerSelect,
  disabled,
}: WclPanelProps) {
  const [url, setUrl] = useState('')

  const handleFetch = () => {
    const trimmed = url.trim()
    if (trimmed !== '') onWclUrl(trimmed)
  }

  return (
    <div className="flex flex-col gap-4">
      {/* URL input + button */}
      <div className="flex flex-col gap-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleFetch()
            }}
            placeholder="https://www.warcraftlogs.com/reports/..."
            disabled={disabled || loading}
            className={cn(
              'flex-1 rounded-lg border bg-[#0d1117] px-4 py-2.5',
              'text-sm text-gray-300 placeholder:text-gray-600',
              'focus:outline-none transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-50',
              error !== undefined
                ? 'border-red-500 focus:border-red-400'
                : 'border-[#30363d] focus:border-[#c8a96e]',
            )}
          />
          <button
            type="button"
            onClick={handleFetch}
            disabled={disabled || loading || url.trim() === ''}
            className={cn(
              'shrink-0 rounded-lg bg-[#c8a96e] px-5 py-2.5 text-sm font-semibold text-[#0d1117]',
              'hover:bg-[#d4b87a] transition-colors',
              'disabled:cursor-not-allowed disabled:opacity-40',
            )}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#0d1117] border-t-transparent" />
                Fetching…
              </span>
            ) : (
              'Fetch log'
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">Paste the full URL including https://</p>
      </div>

      {/* Error */}
      {error !== undefined && <p className="text-xs text-red-400">{error}</p>}

      {/* Player selection */}
      {availablePlayers !== undefined && availablePlayers.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-gray-400">Select your character:</p>
          <div className="flex flex-wrap gap-2">
            {availablePlayers.map((player) => (
              <button
                key={player.id}
                type="button"
                onClick={() => onPlayerSelect(player.id)}
                disabled={disabled}
                className={cn(
                  'rounded-lg border border-[#30363d] bg-[#161b22] px-4 py-2',
                  'text-sm text-gray-300 transition-colors',
                  'hover:border-[#c8a96e] hover:text-[#c8a96e]',
                  'disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                {player.name}
                <span className="ml-1.5 text-xs text-gray-500">{player.subType}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
