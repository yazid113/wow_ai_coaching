'use client'

import Image from 'next/image'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { CLASS_COLORS, WOW_CLASSES } from './classSelector.constants'
import type { ClassSelectorProps, WowSpec } from './classSelector.interfaces'

export function ClassSelector({
  selectedSpecKey,
  selectedHeroTalent,
  onSpecSelect,
  onHeroTalentSelect,
}: ClassSelectorProps) {
  const initialClassKey =
    WOW_CLASSES.find((c) => c.specs.some((s) => s.key === selectedSpecKey))?.key ?? null

  const [browsingClassKey, setBrowsingClassKey] = useState<string | null>(initialClassKey)

  const browsingClass = WOW_CLASSES.find((c) => c.key === browsingClassKey) ?? null
  const selectedClass =
    WOW_CLASSES.find((c) => c.specs.some((s) => s.key === selectedSpecKey)) ?? null
  const selectedSpec = selectedClass?.specs.find((s) => s.key === selectedSpecKey) ?? null

  const handleSpecClick = (spec: WowSpec) => {
    onSpecSelect(spec.key)
    const firstTalent = spec.heroTalents[0]
    if (firstTalent !== undefined) onHeroTalentSelect(firstTalent.key)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Class grid */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Class</p>
        <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
          {WOW_CLASSES.map((cls) => {
            const isActive = browsingClassKey === cls.key
            const color = CLASS_COLORS[cls.key]
            return (
              <button
                key={cls.key}
                type="button"
                onClick={() => setBrowsingClassKey(cls.key)}
                style={isActive && color !== undefined ? { borderColor: color, color } : undefined}
                className={cn(
                  'flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'border-2 bg-[#161b22]'
                    : 'border-[#30363d] bg-[#161b22] text-gray-300 hover:border-gray-500',
                )}
              >
                <Image
                  src={cls.iconUrl}
                  alt={cls.name}
                  width={40}
                  height={40}
                  className={cn(
                    'rounded object-cover mb-2',
                    cls.comingSoon === true && 'grayscale opacity-40',
                  )}
                  unoptimized
                />
                {cls.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Spec row */}
      {browsingClass !== null && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Spec</p>
          <div className="flex flex-wrap gap-2">
            {browsingClass.specs.map((spec) => {
              const isSelected = selectedSpecKey === spec.key
              const color = CLASS_COLORS[browsingClass.key]
              return (
                <button
                  key={spec.key}
                  type="button"
                  onClick={() => handleSpecClick(spec)}
                  style={
                    isSelected && color !== undefined ? { borderColor: color, color } : undefined
                  }
                  className={cn(
                    'rounded-full border px-5 py-2 text-sm font-medium transition-all duration-150',
                    isSelected
                      ? 'border-2 bg-[#161b22]'
                      : 'border-[#30363d] bg-[#161b22] text-gray-300 hover:border-gray-500',
                  )}
                >
                  {spec.name}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Hero talent row */}
      {selectedSpec !== null && selectedSpec.heroTalents.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
            Hero Talent
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSpec.heroTalents.map((talent) => (
              <button
                key={talent.key}
                type="button"
                onClick={() => onHeroTalentSelect(talent.key)}
                className={cn(
                  'rounded-full border px-5 py-2 text-sm font-medium transition-all duration-150',
                  selectedHeroTalent === talent.key
                    ? 'border-[#c8a96e] bg-[#161b22] text-[#c8a96e]'
                    : 'border-[#30363d] bg-[#161b22] text-gray-300 hover:border-gray-500',
                )}
              >
                {talent.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
