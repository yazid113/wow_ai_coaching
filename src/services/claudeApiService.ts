import Anthropic from '@anthropic-ai/sdk'

import { env } from '@/config/env'

// ─── Constants ────────────────────────────────────────────────────────────────

const CLAUDE_MODEL = 'claude-opus-4-6'
const CLAUDE_MAX_TOKENS = 2000

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Calls the Claude API and returns the concatenated text content.
 * Throws a plain Error on failure — callers should wrap into a domain error as needed.
 */
export async function callClaudeAnalysis(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const client = new Anthropic({ apiKey: env.anthropic.apiKey })

  let message: Anthropic.Message
  try {
    message = (await client.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      system: `CRITICAL: You must respond with a valid JSON object only. Do not write any text, explanation, preamble, or spell ID mappings before the JSON. Do not write anything after the JSON. Your entire response must start with { and end with }. Any text outside the JSON will cause a parse failure.\n\n${systemPrompt}`,
      messages: [{ role: 'user', content: userPrompt }],
    })) as Anthropic.Message
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    throw new Error(`Claude API call failed: ${msg}`)
  }

  const textBlocks = message.content
    .filter((block: { type: string }) => block.type === 'text')
    .map((block: { type: string; text?: string }) => block.text ?? '')
    .filter((text: string) => text.trim().length > 0)

  const lastBlock = textBlocks[textBlocks.length - 1]
  if (lastBlock === undefined || lastBlock.trim().length === 0) {
    throw new Error('Claude returned no text content')
  }

  // Strip any preamble text before the opening brace
  const jsonStart = lastBlock.indexOf('{')
  if (jsonStart === -1) {
    throw new Error('No JSON object found in Claude response')
  }
  return lastBlock.slice(jsonStart)
}
