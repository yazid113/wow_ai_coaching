import { env } from '@/config/env'

import { getBlizzardToken } from './blizzardAuth'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BlizzardSpell {
  id: number
  name: string
  description?: string
}

export interface BlizzardMedia {
  id: number
  assets: Array<{ key: string; value: string }>
}

export interface BlizzardCharacter {
  id: number
  name: string
  realm: { slug: string }
  character_class: { name: string }
  active_spec?: { name: string }
}

export class BlizzardApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'BlizzardApiError'
    this.status = status
  }
}

// ─── Private Helpers ──────────────────────────────────────────────────────────

function buildUrl(path: string, params: Record<string, string>): string {
  const region = env.blizzard.region
  const url = new URL(`https://${region}.api.blizzard.com${path}`)
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value)
  }
  return url.toString()
}

async function blizzardGet<T>(url: string): Promise<T> {
  const token = await getBlizzardToken()
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!response.ok) {
    throw new BlizzardApiError(
      response.status,
      `Blizzard API error: ${response.status} ${response.statusText}`,
    )
  }

  return response.json() as Promise<T>
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Fetches spell data from the Blizzard Game Data API.
 * Safe to cache for up to 30 days per Blizzard API terms.
 */
export async function fetchSpell(spellId: number): Promise<BlizzardSpell> {
  const region = env.blizzard.region
  const url = buildUrl(`/data/wow/spell/${spellId}`, {
    namespace: `static-${region}`,
    locale: 'en_US',
  })
  return blizzardGet<BlizzardSpell>(url)
}

/**
 * Fetches character profile data from the Blizzard Profile API.
 * characterName must be lowercase per Blizzard API requirements.
 */
export async function fetchCharacter(
  realmSlug: string,
  characterName: string,
): Promise<BlizzardCharacter> {
  const region = env.blizzard.region
  const url = buildUrl(`/profile/wow/character/${realmSlug}/${characterName.toLowerCase()}`, {
    namespace: `profile-${region}`,
    locale: 'en_US',
  })
  return blizzardGet<BlizzardCharacter>(url)
}

/**
 * Fetches spell media (icon) from the Blizzard Game Data API.
 * The icon asset has key "icon" and value is a fully-qualified render URL.
 */
export async function fetchSpellMedia(spellId: number): Promise<BlizzardMedia> {
  const region = env.blizzard.region
  const url = buildUrl(`/data/wow/media/spell/${spellId}`, {
    namespace: `static-${region}`,
    locale: 'en_US',
  })
  return blizzardGet<BlizzardMedia>(url)
}
