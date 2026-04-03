import { cn } from '@/lib/utils'

import type { AnalysisError, Severity } from './analysisResult.interfaces'

const BORDER_COLOR: Record<Severity, string> = {
  critical: 'border-l-red-500',
  moderate: 'border-l-amber-500',
  minor: 'border-l-blue-500',
}

const BADGE_STYLE: Record<Severity, string> = {
  critical: 'bg-red-500/20 text-red-400',
  moderate: 'bg-amber-500/20 text-amber-400',
  minor: 'bg-blue-500/20 text-blue-400',
}

type ErrorCardProps = AnalysisError

export function ErrorCard({ severity, title, explanation, timestamp }: ErrorCardProps) {
  return (
    <div
      className={cn('overflow-hidden rounded-lg border-l-4 bg-[#161b22]', BORDER_COLOR[severity])}
    >
      <div className="flex items-center justify-between gap-3 px-4 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider',
              BADGE_STYLE[severity],
            )}
          >
            {severity}
          </span>
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {timestamp !== null && (
          <span className="shrink-0 rounded bg-[#0d1117] px-2 py-1 font-mono text-xs text-gray-400">
            {timestamp}
          </span>
        )}
      </div>
      <p className="px-4 pb-4 pt-2 text-sm leading-relaxed text-gray-400">{explanation}</p>
    </div>
  )
}
