const REPORT_CODE_RE = /\/reports\/([A-Za-z0-9]+)/
const VALID_CODE_RE = /^[a-zA-Z0-9]{16}$/
const FIGHT_PARAM_RE = /fight=(\w+)/

export interface WclUrlParseResult {
  reportCode: string
  fightId: number | 'last'
  valid: boolean
  error?: string
}

export function parseWclUrl(url: string): WclUrlParseResult {
  const invalid = (error: string): WclUrlParseResult => ({
    reportCode: '',
    fightId: 1,
    valid: false,
    error,
  })

  const codeMatch = REPORT_CODE_RE.exec(url)
  if (codeMatch === null || codeMatch[1] === undefined) {
    return invalid('Could not extract report code from URL')
  }

  const reportCode = codeMatch[1]
  if (!VALID_CODE_RE.test(reportCode)) {
    return invalid(`Invalid report code "${reportCode}" — expected 16 alphanumeric characters`)
  }

  const fightMatch = FIGHT_PARAM_RE.exec(url)
  const fightParam = fightMatch?.[1]

  if (fightParam === undefined) {
    return { reportCode, fightId: 1, valid: true }
  }

  if (fightParam === 'last') {
    return { reportCode, fightId: 'last', valid: true }
  }

  const fightId = parseInt(fightParam, 10)
  if (Number.isNaN(fightId) || fightId <= 0) {
    return invalid(`Invalid fight ID "${fightParam}"`)
  }

  return { reportCode, fightId, valid: true }
}

export function isWclUrl(input: string): boolean {
  return input.includes('warcraftlogs.com/reports/')
}
