import Anthropic from '@anthropic-ai/sdk'

export function getAnthropic() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')
  return new Anthropic({ apiKey })
}

export const MODELS = {
  // Meal photos and lab extraction: cheap, fast, good enough with a tight prompt.
  haiku: 'claude-haiku-4-5',
  // Weekly insight summaries.
  sonnet: 'claude-sonnet-5',
} as const

export function extractText(response: Anthropic.Message): string {
  return response.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text)
    .join('\n')
    .trim()
}
