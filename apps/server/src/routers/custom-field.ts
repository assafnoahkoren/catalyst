import { prisma } from '@catalyst/db'
import { createCustomFieldSchema, updateCustomFieldSchema } from '@catalyst/validation'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, tenantProcedure } from '../lib/trpc'

export const customFieldRouter = router({
  list: tenantProcedure.query(async ({ ctx }) => {
    return prisma.customFieldDefinition.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { order: 'asc' },
    })
  }),

  create: tenantProcedure
    .input(createCustomFieldSchema)
    .mutation(async ({ ctx, input }) => {
      return prisma.customFieldDefinition.create({
        data: { ...input, tenantId: ctx.tenantId },
      })
    }),

  update: tenantProcedure
    .input(z.object({ id: z.string() }).merge(updateCustomFieldSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const field = await prisma.customFieldDefinition.findFirst({
        where: { id, tenantId: ctx.tenantId },
      })
      if (!field) throw new TRPCError({ code: 'NOT_FOUND' })
      return prisma.customFieldDefinition.update({ where: { id }, data })
    }),

  delete: tenantProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const field = await prisma.customFieldDefinition.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      })
      if (!field) throw new TRPCError({ code: 'NOT_FOUND' })
      return prisma.customFieldDefinition.delete({ where: { id: input.id } })
    }),

  reorder: tenantProcedure
    .input(z.object({ orderedIds: z.array(z.string()).min(1) }))
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.orderedIds.map((id, index) =>
          prisma.customFieldDefinition.updateMany({
            where: { id, tenantId: ctx.tenantId },
            data: { order: index },
          })
        ),
      )
      return { success: true }
    }),
})
