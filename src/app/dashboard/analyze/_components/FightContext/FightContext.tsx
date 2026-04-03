'use client'

import { cn } from '@/lib/utils'

import { FIGHT_TYPE_LABELS, TARGET_COUNT_OPTIONS } from './fightContext.constants'
import type { FightContextProps, FightType } from './fightContext.interfaces'

export function FightContext({ value, onChange }: FightContextProps) {
  const fightTypes: FightType[] = ['raid', 'mythicplus', 'dungeon', 'targetdummy']

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">Fight context</p>

      {/* Fight type */}
      <div className="flex flex-wrap gap-2">
        {fightTypes.map((type) => {
          const isSelected = value.fightType === type
          return (
            <button
              key={type}
              type="button"
              onClick={() => onChange({ ...value, fightType: type })}
              className={cn(
                'rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-150',
                isSelected
                  ? 'bg-[#c8a96e] text-[#0d1117]'
                  : 'border border-[#30363d] text-gray-400 hover:border-gray-500',
              )}
            >
              {FIGHT_TYPE_LABELS[type]}
            </button>
          )
        })}
      </div>

      {/* Target count */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-gray-400">Targets:</span>
        {TARGET_COUNT_OPTIONS.map((count) => {
          const isSelected = value.targetCount === count
          const isLast = count === TARGET_COUNT_OPTIONS[TARGET_COUNT_OPTIONS.length - 1]
          return (
            <button
              key={count}
              type="button"
              onClick={() => onChange({ ...value, targetCount: count })}
              className={cn(
                'rounded-full px-3 py-1 text-sm font-medium transition-all duration-150',
                isSelected
                  ? 'bg-[#c8a96e] text-[#0d1117]'
                  : 'border border-[#30363d] text-gray-400 hover:border-gray-500',
              )}
            >
              {isLast ? '5+' : count}
            </button>
          )
        })}
      </div>
    </div>
  )
}
