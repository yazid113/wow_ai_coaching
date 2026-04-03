export type Severity = 'critical' | 'moderate' | 'minor'

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export type Plan = 'free' | 'pro'

export interface AnalysisError {
  ruleId: string
  timestamp: string | null
  title: string
  explanation: string
  severity: Severity
}

export interface AnalysisResult {
  score: number
  grade: Grade
  summary: string
  errors: AnalysisError[]
  wins: string[]
  top_focus: string
}

export interface AnalyzeResponse {
  analysisId: string
  score: number
  grade: Grade
  summary: string
  errors: AnalysisError[]
  wins: string[]
  top_focus: string
}

export interface UserProfile {
  id: string
  battle_tag: string | null
  plan: Plan
  analyses_this_month: number
}

export interface SpecSummary {
  specKey: string
  className: string
  specName: string
}
