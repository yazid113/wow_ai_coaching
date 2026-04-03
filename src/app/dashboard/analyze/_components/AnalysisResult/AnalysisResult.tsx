import type { AnalysisResultProps } from './analysisResult.interfaces'
import { ErrorCard } from './ErrorCard'
import { ScoreHeader } from './ScoreHeader'
import { WinsSection } from './WinsSection'

export function AnalysisResult({ result, specName, heroTalentName }: AnalysisResultProps) {
  const { score, grade, summary, errors, wins, top_focus } = result

  const criticalErrors = errors.filter((e) => e.severity === 'critical')
  const otherErrors = errors.filter((e) => e.severity !== 'critical')
  const orderedErrors = [...criticalErrors, ...otherErrors]

  return (
    <div className="flex flex-col gap-8">
      {/* Score + grade + summary */}
      <ScoreHeader
        score={score}
        grade={grade}
        summary={summary}
        specName={specName}
        heroTalentName={heroTalentName}
      />

      <hr className="border-[#30363d]" />

      {/* Rotation errors */}
      {orderedErrors.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="flex items-center text-xs font-semibold uppercase tracking-widest text-gray-500">
            Rotation Errors
            <span className="ml-2 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-400">
              {orderedErrors.length}
            </span>
          </h3>
          <div className="flex flex-col gap-2.5">
            {orderedErrors.map((err, i) => (
              <ErrorCard
                key={`${err.ruleId}-${i}`}
                ruleId={err.ruleId}
                severity={err.severity}
                title={err.title}
                explanation={err.explanation}
                timestamp={err.timestamp}
              />
            ))}
          </div>
        </div>
      )}

      {/* Wins */}
      <WinsSection wins={wins} />

      {/* Top focus CTA */}
      <div
        className="rounded-lg border border-[#c8a96e]/30 bg-[#1a1f2e] p-5"
        style={{ borderLeftWidth: '4px', borderLeftColor: '#c8a96e' }}
      >
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#c8a96e]">
          Focus on this next pull
        </p>
        <p className="text-sm leading-relaxed text-white">{top_focus}</p>
      </div>
    </div>
  )
}
