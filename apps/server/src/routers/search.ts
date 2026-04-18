import { prisma } from '@catalyst/db'
import { z } from 'zod'
import { router, tenantProcedure } from '../lib/trpc'

export const searchRouter = router({
  global: tenantProcedure
    .input(z.object({ query: z.string().min(1).max(200) }))
    .query(async ({ ctx, input }) => {
      const q = input.query

      const [customers, notes] = await Promise.all([
        prisma.customer.findMany({
          where: {
            tenantId: ctx.tenantId,
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
              { phone: { contains: q, mode: 'insensitive' } },
            ],
          },
          select: { id: true, name: true, email: true, phone: true },
          take: 10,
        }),
        prisma.note.findMany({
          where: {
            tenantId: ctx.tenantId,
            body: { contains: q, mode: 'insensitive' },
          },
          select: { id: true, body: true, customerId: true },
          take: 5,
        }),
      ])

      return { customers, notes }
    }),
})
