import { chat } from '@catalyst/ai'
import { prisma } from '@catalyst/db'
import { retrieveContext } from '@catalyst/knowledge'
import {
  extractMessageText,
  extractPhoneNumber,
  parseIncomingMessage,
  sendMessage,
} from '@catalyst/whatsapp'
import { Hono } from 'hono'

export const whatsappWebhook = new Hono()

const DEFAULT_HANDOFF_KEYWORDS = ['agent', 'human', 'representative', 'נציג', 'אדם']

whatsappWebhook.post('/webhook', async (c) => {
  const body = await c.req.json()
  const incoming = parseIncomingMessage(body)
  if (!incoming) return c.json({ ok: true })

  const instanceId = String(incoming.instanceData.idInstance)
  const tenant = await prisma.tenant.findFirst({
    where: { greenApiInstance: instanceId },
  })
  if (!tenant) return c.json({ ok: true })

  const phone = extractPhoneNumber(incoming.senderData.chatId)
  const messageText = extractMessageText(incoming)
  if (!messageText) return c.json({ ok: true })

  // Find or create customer
  let customer = await prisma.customer.findFirst({
    where: { phone, tenantId: tenant.id },
  })
  if (!customer) {
    const defaultStatus = await prisma.customerStatus.findFirst({
      where: { tenantId: tenant.id, isDefault: true },
    })
    if (!defaultStatus) return c.json({ ok: true })

    customer = await prisma.customer.create({
      data: {
        name: incoming.senderData.senderName || phone,
        phone,
        tenantId: tenant.id,
        statusId: defaultStatus.id,
        source: 'MANUAL',
      },
    })

    await prisma.activity.create({
      data: {
        type: 'CREATED',
        tenantId: tenant.id,
        customerId: customer.id,
      },
    })
  }

  // Find or create conversation
  let conversation = await prisma.conversation.findFirst({
    where: { customerId: customer.id, tenantId: tenant.id },
  })
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        customerId: customer.id,
        tenantId: tenant.id,
        channel: 'WHATSAPP',
        isBot: true,
      },
    })
  }

  // Save incoming message
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: 'INBOUND',
      sender: 'CUSTOMER',
      body: messageText,
    },
  })

  await prisma.conversation.update({
    where: { id: conversation.id },
    data: { updatedAt: new Date() },
  })

  // Bot mode
  if (conversation.isBot && tenant.greenApiInstance && tenant.greenApiToken) {
    const config = { instanceId: tenant.greenApiInstance, token: tenant.greenApiToken }
    const settings = tenant.settings as Record<string, unknown> ?? {}
    const handoffKeywords = (settings.handoffKeywords as string[]) ?? DEFAULT_HANDOFF_KEYWORDS
    const confidenceThreshold = (settings.confidenceThreshold as number) ?? 0.7

    // Check handoff keywords
    const lowerMessage = messageText.toLowerCase()
    const isHandoff = handoffKeywords.some((kw) => lowerMessage.includes(kw.toLowerCase()))
    if (isHandoff) {
      await prisma.conversation.update({ where: { id: conversation.id }, data: { isBot: false } })
      await sendMessage(config, incoming.senderData.chatId, 'Connecting you with a team member...')
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: 'OUTBOUND',
          sender: 'BOT',
          body: 'Connecting you with a team member...',
        },
      })
      return c.json({ ok: true })
    }

    // RAG pipeline
    const ragResult = await retrieveContext(messageText, tenant.id, 5)

    if (ragResult.topScore < confidenceThreshold) {
      await prisma.conversation.update({ where: { id: conversation.id }, data: { isBot: false } })
      await sendMessage(
        config,
        incoming.senderData.chatId,
        'Let me connect you with a team member...',
      )
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          direction: 'OUTBOUND',
          sender: 'BOT',
          body: 'Let me connect you with a team member...',
        },
      })
      return c.json({ ok: true })
    }

    // Get conversation history
    const recentMessages = await prisma.message.findMany({
      where: { conversationId: conversation.id },
      orderBy: { sentAt: 'desc' },
      take: 10,
    })

    const reply = await chat({
      systemPrompt:
        `You are a helpful assistant for ${tenant.name}.\nAnswer using ONLY the context below.\nIf the context doesn't contain enough information, say you'll connect them with a team member.\nKeep responses concise and friendly. Reply in ${tenant.language}.`,
      context: ragResult.context,
      conversationHistory: recentMessages.toReversed().map((m) => ({
        role: m.sender === 'CUSTOMER' ? 'user' as const : 'assistant' as const,
        content: m.body,
      })),
      userMessage: messageText,
    })

    await sendMessage(config, incoming.senderData.chatId, reply)
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        direction: 'OUTBOUND',
        sender: 'BOT',
        body: reply,
      },
    })
  }

  return c.json({ ok: true })
})
