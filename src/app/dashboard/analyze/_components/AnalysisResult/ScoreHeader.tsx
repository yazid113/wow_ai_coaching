import { cn } from '@/lib/utils'

import { CLASS_COLORS, WOW_CLASSES } from '../ClassSelector/classSelector.constants'

import type { Grade } from './analysisResult.interfaces'

interface ScoreHeaderProps {
  score: number
  grade: Grade
  summary: string
  specName: string
  heroTalentName?: string | undefined
}

const SCORE_COLOR: Record<Grade, string> = {
  S: 'text-[#c8a96e]',
  A: 'text-[#c8a96e]',
  B: 'text-blue-400',
  C: 'text-yellow-400',
  D: 'text-orange-400',
  F: 'text-red-500',
}

const GRADE_STYLE: Record<Grade, string> = {
  S: 'bg-[#c8a96e]/20 text-[#c8a96e] border border-[#c8a96e]/50',
  A: 'bg-[#c8a96e]/20 text-[#c8a96e] border border-[#c8a96e]/50',
  B: 'bg-blue-500/20 text-blue-400 border border-blue-500/50',
  C: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50',
  D: 'bg-orange-500/20 text-orange-400 border border-orange-500/50',
  F: 'bg-red-500/20 text-red-500 border border-red-500/50',
}

function getClassColor(specName: string): string | undefined {
  for (const cls of WOW_CLASSES) {
    if (specName.startsWith(cls.name)) return CLASS_COLORS[cls.key]
  }
  return undefined
}

export function ScoreHeader({ score, grade, summary, specName, heroTalentName }: ScoreHeaderProps) {
  const classColor = getClassColor(specName)

  return (
    <div className="flex flex-col gap-4">
      {/* Spec + hero talent badges */}
      <div className="flex flex-wrap items-center gap-2">
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

      {/* Score + grade */}
      <div className="flex items-center gap-5">
        <span className={cn('text-6xl font-black leading-none tabular-nums', SCORE_COLOR[grade])}>
          {score}
        </span>
        <div className="flex flex-col items-start gap-1.5">
          <span
            className={cn(
              'rounded-lg px-3 py-1.5 text-2xl font-black leading-none',
              GRADE_STYLE[grade],
            )}
          >
            {grade}
          </span>
          <span className="text-xs uppercase tracking-wide text-gray-500">Grade</span>
        </div>
      </div>

      {/* Summary */}
      <p className="max-w-2xl text-base leading-relaxed text-gray-300">{summary}</p>
    </div>
  )
}
