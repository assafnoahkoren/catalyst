import type { IncomingMessage } from './types'

export function parseIncomingMessage(body: unknown): IncomingMessage | null {
  const data = body as Record<string, unknown>
  if (data.typeWebhook !== 'incomingMessageReceived') return null
  return data as unknown as IncomingMessage
}

export function extractMessageText(message: IncomingMessage): string {
  const { messageData } = message
  if (messageData.textMessageData?.textMessage) {
    return messageData.textMessageData.textMessage
  }
  if (messageData.extendedTextMessageData?.text) {
    return messageData.extendedTextMessageData.text
  }
  return ''
}

export function extractPhoneNumber(chatId: string): string {
  // green-api chatId format: "1234567890@c.us"
  return chatId.replace('@c.us', '').replace('@g.us', '')
}
