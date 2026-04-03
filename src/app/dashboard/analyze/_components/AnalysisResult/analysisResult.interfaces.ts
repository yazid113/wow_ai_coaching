export type Severity = 'critical' | 'moderate' | 'minor'
export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export interface AnalysisError {
  ruleId: string
  severity: Severity
  title: string
  explanation: string
  timestamp: string | null
}

export interface AnalysisResultData {
  score: number
  grade: Grade
  summary: string
  errors: AnalysisError[]
  wins: string[]
  top_focus: string
}

export interface AnalysisResultProps {
  result: AnalysisResultData
  specName: string
  heroTalentName?: string | undefined
}
