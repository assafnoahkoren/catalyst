import { prisma } from '@catalyst/db'
import { router, tenantProcedure } from '../lib/trpc'

export const dashboardRouter = router({
  getStats: tenantProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [
      totalCustomers,
      newToday,
      activeConversations,
      totalMessages,
      wonCount,
      lostCount,
      kbCount,
      memberCount,
    ] = await Promise.all([
      prisma.customer.count({ where: { tenantId: ctx.tenantId } }),
      prisma.customer.count({
        where: { tenantId: ctx.tenantId, createdAt: { gte: todayStart } },
      }),
      prisma.conversation.count({
        where: { tenantId: ctx.tenantId },
      }),
      prisma.message.count({
        where: { conversation: { tenantId: ctx.tenantId } },
      }),
      prisma.customer.count({
        where: {
          tenantId: ctx.tenantId,
          status: { isClosed: true, name: { not: { contains: 'Lost' } } },
        },
      }),
      prisma.customer.count({
        where: { tenantId: ctx.tenantId, status: { isClosed: true, name: { contains: 'Lost' } } },
      }),
      prisma.knowledgeEntry.count({ where: { tenantId: ctx.tenantId } }),
      prisma.tenantMember.count({ where: { tenantId: ctx.tenantId } }),
    ])

    const conversionRate = wonCount + lostCount > 0
      ? Math.round((wonCount / (wonCount + lostCount)) * 100)
      : null

    return {
      totalCustomers,
      newToday,
      activeConversations,
      totalMessages,
      conversionRate,
      checklist: {
        hasCustomers: totalCustomers > 0,
        hasKnowledgeBase: kbCount > 0,
        hasTeamMembers: memberCount > 1,
      },
    }
  }),

  getFunnel: tenantProcedure.query(async ({ ctx }) => {
    const [statuses, groupedCounts] = await Promise.all([
      prisma.customerStatus.findMany({
        where: { tenantId: ctx.tenantId },
        orderBy: { order: 'asc' },
      }),
      prisma.customer.groupBy({
        by: ['statusId'],
        where: { tenantId: ctx.tenantId },
        _count: true,
      }),
    ])

    const countMap = new Map(groupedCounts.map((g) => [g.statusId, g._count]))

    return statuses.map((status) => ({
      name: status.name,
      color: status.color,
      count: countMap.get(status.id) ?? 0,
    }))
  }),

  getMessageBreakdown: tenantProcedure.query(async ({ ctx }) => {
    const [botCount, humanCount, customerCount] = await Promise.all([
      prisma.message.count({
        where: { conversation: { tenantId: ctx.tenantId }, sender: 'BOT' },
      }),
      prisma.message.count({
        where: { conversation: { tenantId: ctx.tenantId }, sender: 'HUMAN' },
      }),
      prisma.message.count({
        where: { conversation: { tenantId: ctx.tenantId }, sender: 'CUSTOMER' },
      }),
    ])
    return { bot: botCount, human: humanCount, customer: customerCount }
  }),
})
