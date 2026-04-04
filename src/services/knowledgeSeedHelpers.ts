import { env } from '@/config/env'

// ─── APL Knowledge Derivation ─────────────────────────────────────────────────

/**
 * Calls Claude to derive structured rotation coaching facts from a raw SimC APL.
 * Returns an empty string on failure — callers treat < 50 chars as a failure.
 */
export async function deriveKnowledgeFromApl(
  specName: string,
  heroTalent: string,
  aplContent: string,
  patchVersion: string,
): Promise<string> {
  const aplExcerpt = aplContent.slice(0, 6000)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 25_000)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
        'x-api-key': env.anthropic.apiKey,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: [
          'You are a World of Warcraft SimulationCraft APL expert for patch ' + patchVersion + '.',
          'You read raw SimC APL files and extract precise, factual coaching information.',
          'You answer ONLY from what is explicitly present in the APL — never from general WoW knowledge.',
          'If a value cannot be determined from the APL, write UNKNOWN rather than guessing.',
          'Be concise. No padding. No preamble. Output the facts directly.',
        ].join('\n'),
        messages: [
          {
            role: 'user',
            content: [
              `Spec: ${specName}`,
              `Hero Talent: ${heroTalent}`,
              `Patch: ${patchVersion}`,
              '',
              'Here is the SimC APL file:',
              '```',
              aplExcerpt,
              '```',
              '',
              'From this APL, extract the following. Use ONLY what is in the APL above.',
              '',
              'SECTION 1 — KEY FACTS (list as "FACT N: ...")',
              '- Main resource spender spell and its minimum resource threshold (from conditions like soul_shard>=3)',
              '- Major cooldown spell name (look for the cooldown sub-list or highest-priority use_item/major cd)',
              '- Any buff that gates key spell usage (e.g. buff.heating_up.up before fire_blast)',
              '- Any spells that should NOT be cast when a certain buff is active',
              `- Any ${heroTalent}-specific conditions or spells that only appear in hero-talent branches`,
              '',
              'SECTION 2 — PRIORITY LIST',
              `Write the ${heroTalent} single-target priority as a numbered list (max 8 items).`,
              'Use the spell names exactly as they appear in the APL.',
              'Include the key condition for each spell in plain English (e.g. "only when Heating Up is active").',
              '',
              'SECTION 3 — COMMON MISTAKES',
              'List 3 mistakes a player would make that this APL is designed to prevent.',
              'Base these on the conditions in the APL, not general WoW knowledge.',
              '',
              'Keep the total response under 400 words.',
            ].join('\n'),
          },
        ],
      }),
    })

    clearTimeout(timeoutId)

    if (!response.ok) return ''

    const data = (await response.json()) as { content: Array<{ type: string; text?: string }> }
    const text = data.content
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text ?? '')
      .join('\n')
      .trim()

    return text
  } catch {
    clearTimeout(timeoutId)
    return ''
  }
}
