import { prisma } from '@catalyst/db'
import { createAutomationFlowSchema, updateAutomationFlowSchema } from '@catalyst/validation'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, tenantProcedure } from '../lib/trpc'

export const automationRouter = router({
  list: tenantProcedure.query(async ({ ctx }) => {
    return prisma.automationFlow.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: 'desc' },
    })
  }),

  getById: tenantProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const flow = await prisma.automationFlow.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      })
      if (!flow) throw new TRPCError({ code: 'NOT_FOUND' })
      return flow
    }),

  create: tenantProcedure
    .input(createAutomationFlowSchema)
    .mutation(async ({ ctx, input }) => {
      return prisma.automationFlow.create({
        data: {
          name: input.name,
          isActive: input.isActive,
          trigger: input.trigger as never,
          steps: input.steps as never,
          tenantId: ctx.tenantId,
        },
      })
    }),

  update: tenantProcedure
    .input(z.object({ id: z.string() }).merge(updateAutomationFlowSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, trigger, steps, ...rest } = input
      const flow = await prisma.automationFlow.findFirst({
        where: { id, tenantId: ctx.tenantId },
      })
      if (!flow) throw new TRPCError({ code: 'NOT_FOUND' })
      return prisma.automationFlow.update({
        where: { id },
        data: {
          ...rest,
          ...(trigger !== undefined && { trigger: trigger as never }),
          ...(steps !== undefined && { steps: steps as never }),
        },
      })
    }),

  toggleActive: tenantProcedure
    .input(z.object({ id: z.string(), isActive: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const flow = await prisma.automationFlow.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      })
      if (!flow) throw new TRPCError({ code: 'NOT_FOUND' })
      return prisma.automationFlow.update({
        where: { id: input.id },
        data: { isActive: input.isActive },
      })
    }),

  delete: tenantProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const flow = await prisma.automationFlow.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      })
      if (!flow) throw new TRPCError({ code: 'NOT_FOUND' })
      return prisma.automationFlow.delete({ where: { id: input.id } })
    }),

  getLogs: tenantProcedure
    .input(z.object({ flowId: z.string() }))
    .query(async ({ ctx, input }) => {
      const flow = await prisma.automationFlow.findFirst({
        where: { id: input.flowId, tenantId: ctx.tenantId },
      })
      if (!flow) throw new TRPCError({ code: 'NOT_FOUND' })
      return prisma.automationLog.findMany({
        where: { flowId: input.flowId },
        orderBy: { executedAt: 'desc' },
        take: 50,
      })
    }),
})
