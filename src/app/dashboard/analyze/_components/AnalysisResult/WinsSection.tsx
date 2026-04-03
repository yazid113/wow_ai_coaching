interface WinsSectionProps {
  wins: string[]
}

export function WinsSection({ wins }: WinsSectionProps) {
  if (wins.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
        What you did well
      </h3>
      <ul className="flex flex-col gap-2">
        {wins.map((win, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <span className="mt-0.5 shrink-0 text-[#c8a96e]" aria-hidden>
              ✓
            </span>
            <span className="text-sm leading-relaxed text-gray-300">{win}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
