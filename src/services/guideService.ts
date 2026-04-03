import { env } from '@/config/env'

export async function fetchSpecGuideContext(
  specName: string,
  heroTalent: string,
  talentNames?: string[],
): Promise<string> {
  try {
    const talentContext =
      talentNames !== undefined && talentNames.length > 0
        ? `The player has these talents selected: ${talentNames.slice(0, 20).join(', ')}.`
        : ''

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000)

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
        max_tokens: 800,
        messages: [
          {
            role: 'user',
            content: `${talentContext}

SPECIFIC FACTS NEEDED (search for exact values):
- What is the exact base cooldown in seconds for the main cooldown of ${specName}?
- What are the resource costs for key spells? (e.g. how many Soul Shards does Hand of Guldan cost?)
- Which spells were MERGED with other spells in Midnight? (e.g. Vilefiend merged with Dreadstalkers)
- Which talents make normally suboptimal spells become DPS gains? (e.g. Implosion on single target with To Hell and Back)
- Does the main cooldown (e.g. Demonic Tyrant) use a SNAPSHOT of stats/demons at cast time, or does it UPDATE DYNAMICALLY during its duration?
  This is critical — if dynamic, pre-cast demon stacking matters much less than during-cast demon generation.

List these as explicit numbered facts:
FACT 1: [Spell] cooldown = [X] seconds base
FACT 2: [Spell] costs [X] [resource]
FACT 3: [Spell A] was merged with [Spell B] in Midnight
FACT 4: [Talent] makes [Spell] correct on [scenario]
FACT: [Cooldown name] is [snapshot/dynamic] — [implication for rotation]

These facts will be used to verify analysis accuracy.

Search Icy Veins (icy-veins.com), Wowhead (wowhead.com), Method (method.gg) and Maxroll (maxroll.gg) for the current Midnight Season 1 rotation guide for ${specName} with ${heroTalent} hero talent.

CRITICAL PRIORITIES:
1. List abilities that were REDESIGNED or MERGED in Midnight — many abilities work completely differently now. Format:
   [Spell]: Was [old behavior] → Now [new behavior]

2. For each talent the player has selected above, explain if it changes any rotation priorities or makes any abilities work differently.

3. ${heroTalent}-specific priority list (max 7 items)

4. Key cooldown durations for ${specName} ${heroTalent} in Midnight Season 1 — list the actual cooldown in seconds for each major ability after haste reduction.

Keep under 400 words. Be specific about talent interactions. If a talent fundamentally changes how an ability works, say so explicitly. If you cannot find ${heroTalent}-specific information, explicitly state that rather than giving generic advice.`,
          },
        ],
      }),
    })

    clearTimeout(timeoutId)

    if (!response.ok) return ''

    const data = (await response.json()) as { content: Array<{ type: string; text?: string }> }
    const text = data.content
      .filter((block) => block.type === 'text' && block.text)
      .map((block) => block.text ?? '')
      .join('\n')
      .trim()
    return text
  } catch {
    return ''
  }
}
