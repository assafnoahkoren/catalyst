import { prisma } from '@catalyst/db'
import {
  createCustomerStatusSchema,
  reorderStatusesSchema,
  updateCustomerStatusSchema,
} from '@catalyst/validation'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, tenantProcedure } from '../lib/trpc'

export const customerStatusRouter = router({
  list: tenantProcedure.query(async ({ ctx }) => {
    return prisma.customerStatus.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { order: 'asc' },
    })
  }),

  create: tenantProcedure
    .input(createCustomerStatusSchema)
    .mutation(async ({ ctx, input }) => {
      return prisma.customerStatus.create({
        data: { ...input, tenantId: ctx.tenantId },
      })
    }),

  update: tenantProcedure
    .input(z.object({ id: z.string() }).merge(updateCustomerStatusSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input
      const status = await prisma.customerStatus.findFirst({
        where: { id, tenantId: ctx.tenantId },
      })
      if (!status) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      return prisma.customerStatus.update({ where: { id }, data })
    }),

  delete: tenantProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const status = await prisma.customerStatus.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      })
      if (!status) {
        throw new TRPCError({ code: 'NOT_FOUND' })
      }
      if (status.isDefault) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete the default status',
        })
      }
      const customersUsingStatus = await prisma.customer.count({
        where: { statusId: input.id },
      })
      if (customersUsingStatus > 0) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Cannot delete a status that has customers',
        })
      }
      return prisma.customerStatus.delete({ where: { id: input.id } })
    }),

  reorder: tenantProcedure
    .input(reorderStatusesSchema)
    .mutation(async ({ ctx, input }) => {
      await Promise.all(
        input.orderedIds.map((id, index) =>
          prisma.customerStatus.updateMany({
            where: { id, tenantId: ctx.tenantId },
            data: { order: index },
          })
        ),
      )
      return { success: true }
    }),
})
