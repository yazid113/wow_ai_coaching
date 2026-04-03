'use client'

import { LOADING_TIPS } from '../analyzePage.constants'

interface LoadingViewProps {
  tipIndex: number
}

export function LoadingView({ tipIndex }: LoadingViewProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <div className="relative flex items-center justify-center">
        <div className="h-24 w-24 animate-pulse rounded-full bg-[#c8a96e]/20" />
        <div className="absolute h-10 w-10 rounded-full bg-[#c8a96e]/60" />
      </div>
      <div>
        <p className="text-xl font-semibold text-white">Analysing your rotation…</p>
        <p className="mt-3 text-sm text-gray-400 transition-opacity duration-500">
          {LOADING_TIPS[tipIndex]}
        </p>
      </div>
    </div>
  )
}
