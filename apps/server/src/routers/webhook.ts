import { prisma } from '@catalyst/db'
import { createWebhookEndpointSchema, updateWebhookEndpointSchema } from '@catalyst/validation'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, tenantProcedure } from '../lib/trpc'

function generateToken() {
  return Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('')
}

export const webhookRouter = router({
  list: tenantProcedure.query(async ({ ctx }) => {
    return prisma.webhookEndpoint.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: 'desc' },
    })
  }),

  create: tenantProcedure
    .input(createWebhookEndpointSchema)
    .mutation(async ({ ctx, input }) => {
      return prisma.webhookEndpoint.create({
        data: {
          token: generateToken(),
          fieldMapping: input.fieldMapping as never,
          tenantId: ctx.tenantId,
        },
      })
    }),

  update: tenantProcedure
    .input(z.object({ id: z.string() }).merge(updateWebhookEndpointSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, fieldMapping, ...rest } = input
      const endpoint = await prisma.webhookEndpoint.findFirst({
        where: { id, tenantId: ctx.tenantId },
      })
      if (!endpoint) throw new TRPCError({ code: 'NOT_FOUND' })
      return prisma.webhookEndpoint.update({
        where: { id },
        data: {
          ...rest,
          ...(fieldMapping !== undefined && { fieldMapping: fieldMapping as never }),
        },
      })
    }),

  delete: tenantProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const endpoint = await prisma.webhookEndpoint.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      })
      if (!endpoint) throw new TRPCError({ code: 'NOT_FOUND' })
      return prisma.webhookEndpoint.delete({ where: { id: input.id } })
    }),
})
