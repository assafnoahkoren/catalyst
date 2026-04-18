import { prisma } from '@catalyst/db'
import { router, tenantProcedure } from '../lib/trpc'

export const dashboardRouter = router({
  getStats: tenantProcedure.query(async ({ ctx }) => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    const [totalCustomers, newToday, activeConversations, totalMessages] = await Promise.all([
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
    ])

    return { totalCustomers, newToday, activeConversations, totalMessages }
  }),

  getFunnel: tenantProcedure.query(async ({ ctx }) => {
    const statuses = await prisma.customerStatus.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { order: 'asc' },
    })

    const counts = await Promise.all(
      statuses.map(async (status) => ({
        name: status.name,
        color: status.color,
        count: await prisma.customer.count({
          where: { tenantId: ctx.tenantId, statusId: status.id },
        }),
      })),
    )

    return counts
  }),
})
