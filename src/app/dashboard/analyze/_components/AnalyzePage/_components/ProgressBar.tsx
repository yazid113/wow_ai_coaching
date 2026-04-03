'use client'

import { cn } from '@/lib/utils'

const STEPS = ['Select Spec', 'Paste Log', 'Results'] as const

interface ProgressBarProps {
  currentStepIndex: number
}

export function ProgressBar({ currentStepIndex }: ProgressBarProps) {
  return (
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
  )
}
