import { prisma } from '@catalyst/db'
import { sendMessageSchema, toggleBotSchema } from '@catalyst/validation'
import { sendMessage } from '@catalyst/whatsapp'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, tenantProcedure } from '../lib/trpc'

export const conversationRouter = router({
  list: tenantProcedure.query(async ({ ctx }) => {
    const conversations = await prisma.conversation.findMany({
      where: { tenantId: ctx.tenantId },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Calculate unread count per conversation
    const withUnread = await Promise.all(
      conversations.map(async (conv) => {
        const unreadCount = conv.lastReadAt
          ? await prisma.message.count({
            where: {
              conversationId: conv.id,
              sentAt: { gt: conv.lastReadAt },
              direction: 'INBOUND',
            },
          })
          : await prisma.message.count({
            where: { conversationId: conv.id, direction: 'INBOUND' },
          })
        return { ...conv, unreadCount }
      }),
    )

    return withUnread
  }),

  markRead: tenantProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const conv = await prisma.conversation.findFirst({
        where: { id: input.conversationId, tenantId: ctx.tenantId },
      })
      if (!conv) throw new TRPCError({ code: 'NOT_FOUND' })
      return prisma.conversation.update({
        where: { id: input.conversationId },
        data: { lastReadAt: new Date() },
      })
    }),

  getMessages: tenantProcedure
    .input(z.object({
      conversationId: z.string(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const conversation = await prisma.conversation.findFirst({
        where: { id: input.conversationId, tenantId: ctx.tenantId },
      })
      if (!conversation) throw new TRPCError({ code: 'NOT_FOUND' })

      const [items, total] = await Promise.all([
        prisma.message.findMany({
          where: { conversationId: input.conversationId },
          orderBy: { sentAt: 'desc' },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.message.count({ where: { conversationId: input.conversationId } }),
      ])

      return { items: items.toReversed(), total }
    }),

  sendMessage: tenantProcedure
    .input(sendMessageSchema)
    .mutation(async ({ ctx, input }) => {
      const conversation = await prisma.conversation.findFirst({
        where: { id: input.conversationId, tenantId: ctx.tenantId },
        include: { customer: true },
      })
      if (!conversation) throw new TRPCError({ code: 'NOT_FOUND' })

      const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: ctx.tenantId } })

      if (tenant.greenApiInstance && tenant.greenApiToken && conversation.customer.phone) {
        await sendMessage(
          { instanceId: tenant.greenApiInstance, token: tenant.greenApiToken },
          `${conversation.customer.phone}@c.us`,
          input.body,
        )
      }

      const message = await prisma.message.create({
        data: {
          conversationId: input.conversationId,
          direction: 'OUTBOUND',
          sender: 'HUMAN',
          body: input.body,
        },
      })

      await prisma.conversation.update({
        where: { id: input.conversationId },
        data: { updatedAt: new Date() },
      })

      return message
    }),

  toggleBot: tenantProcedure
    .input(toggleBotSchema)
    .mutation(async ({ ctx, input }) => {
      const conversation = await prisma.conversation.findFirst({
        where: { id: input.conversationId, tenantId: ctx.tenantId },
      })
      if (!conversation) throw new TRPCError({ code: 'NOT_FOUND' })

      return prisma.conversation.update({
        where: { id: input.conversationId },
        data: { isBot: input.isBot },
      })
    }),
})
