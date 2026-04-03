import { env } from '@/config/env'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WclToken {
  accessToken: string
  expiresAt: number // unix ms
}

interface TokenApiResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export class WclAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WclAuthError'
  }
}

// ─── Constants ────────────────────────────────────────────────────────────────

const WCL_TOKEN_URL = 'https://www.warcraftlogs.com/oauth/token'
const TOKEN_EXPIRY_BUFFER_MS = 60_000

// ─── Module-level cache ───────────────────────────────────────────────────────

let cachedToken: WclToken | null = null

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns a valid WarcraftLogs access token string.
 * Uses a cached token if one exists and is not within 60s of expiry.
 * Otherwise fetches a new token via the client credentials OAuth2 flow.
 */
export async function getWclToken(): Promise<string> {
  const now = Date.now()

  if (cachedToken !== null && cachedToken.expiresAt - TOKEN_EXPIRY_BUFFER_MS > now) {
    return cachedToken.accessToken
  }

  const credentials = Buffer.from(`${env.wcl.clientId}:${env.wcl.clientSecret}`).toString('base64')

  const response = await fetch(WCL_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new WclAuthError(
      `WarcraftLogs OAuth token request failed: ${response.status} ${response.statusText}`,
    )
  }

  const data = (await response.json()) as TokenApiResponse

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + data.expires_in * 1_000,
  }

  return cachedToken.accessToken
}

/**
 * Clears the cached token. Used in tests and error recovery flows
 * where the cached token is known to be invalid.
 */
export function clearWclTokenCache(): void {
  cachedToken = null
}
