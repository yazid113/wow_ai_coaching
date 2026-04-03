import Anthropic from '@anthropic-ai/sdk'

import { env } from '@/config/env'

// ─── Constants ────────────────────────────────────────────────────────────────

const CLAUDE_MODEL = 'claude-opus-4-6'
const CLAUDE_MAX_TOKENS = 2000

const WEB_SEARCH_INSTRUCTION =
  'You have access to web search.\nSTRICT LIMIT: Maximum 1 search total.\nSearch ONLY if you cannot determine whether Demonic Tyrant is dynamic or snapshot in Midnight.\nAfter 1 search, write the JSON immediately.\nDo not search for anything else.'

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
      system: `${systemPrompt}\n\n${WEB_SEARCH_INSTRUCTION}`,
      messages: [
        { role: 'user', content: userPrompt },
        { role: 'assistant', content: '{' },
      ],
      tools: [
        { type: 'web_search_20250305', name: 'web_search' },
      ] as unknown as Anthropic.Messages.ToolUnion[],
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
  const fullResponse = '{' + lastBlock
  return fullResponse
}
