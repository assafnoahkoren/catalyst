import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions'
import { openai } from './client'

const CHAT_MODEL = 'gpt-4o'

export interface ChatOptions {
  systemPrompt: string
  context: string
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>
  userMessage: string
  maxTokens?: number
}

export async function chat(options: ChatOptions): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: options.systemPrompt },
    { role: 'system', content: `## Context\n${options.context}` },
    ...options.conversationHistory.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
    { role: 'user', content: options.userMessage },
  ]

  const response = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages,
    max_tokens: options.maxTokens ?? 500,
    temperature: 0.7,
  })

  return response.choices[0]?.message?.content ?? ''
}
