import { createServiceClient } from '@/lib/supabase/serviceClient'

import { fetchSpecGuideContext } from './guideService'

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000

export async function getSpecKnowledge(
  specKey: string,
  heroTalent: string,
  specName: string,
  patchVersion: string,
): Promise<string> {
  const supabase = createServiceClient()

  const { data } = await supabase
    .from('spec_knowledge')
    .select('knowledge')
    .eq('spec_key', specKey)
    .eq('hero_talent', heroTalent)
    .eq('patch_version', patchVersion)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle()

  if (data !== null) {
    return (data as { knowledge: string }).knowledge
  }

  const result = await fetchSpecGuideContext(specName, heroTalent, [])

  if (result === '') return ''

  const expiresAt = new Date(Date.now() + THIRTY_DAYS_MS).toISOString()

  await supabase.from('spec_knowledge').upsert(
    {
      spec_key: specKey,
      hero_talent: heroTalent,
      patch_version: patchVersion,
      knowledge: result,
      expires_at: expiresAt,
    },
    { onConflict: 'spec_key,hero_talent,patch_version' },
  )

  return result
}
