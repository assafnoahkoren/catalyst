import { z } from 'zod'

export const sendMessageSchema = z.object({
  conversationId: z.string(),
  body: z.string().min(1).max(4096),
})

export const toggleBotSchema = z.object({
  conversationId: z.string(),
  isBot: z.boolean(),
})

export type SendMessageInput = z.infer<typeof sendMessageSchema>
export type ToggleBotInput = z.infer<typeof toggleBotSchema>
