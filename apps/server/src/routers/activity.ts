import { prisma } from '@catalyst/db'
import { z } from 'zod'
import { router, tenantProcedure } from '../lib/trpc'

export const activityRouter = router({
  list: tenantProcedure
    .input(z.object({
      customerId: z.string(),
      page: z.number().int().min(1).default(1),
      pageSize: z.number().int().min(1).max(100).default(50),
    }))
    .query(async ({ ctx, input }) => {
      const [items, total] = await Promise.all([
        prisma.activity.findMany({
          where: { customerId: input.customerId, tenantId: ctx.tenantId },
          orderBy: { createdAt: 'desc' },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.activity.count({
          where: { customerId: input.customerId, tenantId: ctx.tenantId },
        }),
      ])
      return { items, total, page: input.page, pageSize: input.pageSize }
    }),
})
