export interface GreenApiConfig {
  instanceId: string
  token: string
}

export interface IncomingMessage {
  typeWebhook: string
  instanceData: { idInstance: number }
  timestamp: number
  idMessage: string
  senderData: {
    chatId: string
    sender: string
    senderName: string
  }
  messageData: {
    typeMessage: string
    textMessageData?: { textMessage: string }
    extendedTextMessageData?: { text: string }
  }
}

export interface SendMessageResult {
  idMessage: string
}
