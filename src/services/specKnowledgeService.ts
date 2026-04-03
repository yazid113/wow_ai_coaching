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

  console.log('[SpecKnowledge] Checking cache for:', specKey, heroTalent)

  const { data } = await supabase
    .from('spec_knowledge')
    .select('knowledge')
    .eq('spec_key', specKey)
    .eq('hero_talent', heroTalent)
    .eq('patch_version', patchVersion)
    .gt('expires_at', new Date().toISOString())
    .limit(1)
    .maybeSingle()

  const row = data as { knowledge: string } | null
  console.log('[SpecKnowledge] Cache hit:', (row?.knowledge.length ?? 0) > 50)

  if (row?.knowledge && row.knowledge.length > 50) {
    return row.knowledge
  }

  const knowledgePromise = fetchSpecGuideContext(specName, heroTalent, [])
  const timeoutPromise = new Promise<string>((resolve) => setTimeout(() => resolve(''), 15000))

  let result: string
  try {
    result = await Promise.race([knowledgePromise, timeoutPromise])
  } catch {
    result = ''
  }

  console.log('[SpecKnowledge] Storing knowledge, length:', result.length)

  const { error: upsertError } = await supabase.from('spec_knowledge').upsert(
    {
      spec_key: specKey,
      hero_talent: heroTalent,
      patch_version: patchVersion,
      knowledge: result,
      expires_at: new Date(Date.now() + THIRTY_DAYS_MS).toISOString(),
    },
    { onConflict: 'spec_key,hero_talent,patch_version' },
  )

  if (upsertError) {
    console.error('[SpecKnowledge] Upsert error:', upsertError)
  }

  console.log('[SpecKnowledge] Upsert result:', upsertError ?? 'success')

  return result
}
