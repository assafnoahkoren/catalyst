import { prisma } from '@catalyst/db'
import {
  changeCustomerStatusSchema,
  createCustomerSchema,
  updateCustomerSchema,
} from '@catalyst/validation'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, tenantProcedure } from '../lib/trpc'

const listInputSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  statusId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

export const customerRouter = router({
  list: tenantProcedure
    .input(listInputSchema)
    .query(async ({ ctx, input }) => {
      const where: Record<string, unknown> = { tenantId: ctx.tenantId }
      if (input.statusId) where.statusId = input.statusId
      if (input.search) {
        where.OR = [
          { name: { contains: input.search, mode: 'insensitive' } },
          { email: { contains: input.search, mode: 'insensitive' } },
          { phone: { contains: input.search, mode: 'insensitive' } },
        ]
      }

      const [items, total] = await Promise.all([
        prisma.customer.findMany({
          where: where as never,
          include: { status: true },
          orderBy: { [input.sortBy]: input.sortOrder },
          skip: (input.page - 1) * input.pageSize,
          take: input.pageSize,
        }),
        prisma.customer.count({ where: where as never }),
      ])

      return { items, total, page: input.page, pageSize: input.pageSize }
    }),

  getById: tenantProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const customer = await prisma.customer.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: { status: true },
      })
      if (!customer) throw new TRPCError({ code: 'NOT_FOUND' })
      return customer
    }),

  create: tenantProcedure
    .input(createCustomerSchema)
    .mutation(async ({ ctx, input }) => {
      const { customFields, ...rest } = input
      const customer = await prisma.customer.create({
        data: {
          ...rest,
          tenantId: ctx.tenantId,
          ...(customFields && { customFields: customFields as never }),
        },
      })
      await prisma.activity.create({
        data: {
          type: 'CREATED',
          tenantId: ctx.tenantId,
          customerId: customer.id,
          actorId: ctx.user.id,
        },
      })
      return customer
    }),

  update: tenantProcedure
    .input(z.object({ id: z.string() }).merge(updateCustomerSchema))
    .mutation(async ({ ctx, input }) => {
      const { id, customFields, ...rest } = input
      const existing = await prisma.customer.findFirst({
        where: { id, tenantId: ctx.tenantId },
      })
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' })
      return prisma.customer.update({
        where: { id },
        data: {
          ...rest,
          ...(customFields !== undefined && { customFields: customFields as never }),
        },
      })
    }),

  changeStatus: tenantProcedure
    .input(z.object({ id: z.string() }).merge(changeCustomerStatusSchema))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.customer.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
        include: { status: true },
      })
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' })

      const newStatus = await prisma.customerStatus.findFirst({
        where: { id: input.statusId, tenantId: ctx.tenantId },
      })
      if (!newStatus) throw new TRPCError({ code: 'NOT_FOUND', message: 'Status not found' })

      const customer = await prisma.customer.update({
        where: { id: input.id },
        data: { statusId: input.statusId },
      })

      await prisma.activity.create({
        data: {
          type: 'STATUS_CHANGE',
          tenantId: ctx.tenantId,
          customerId: input.id,
          actorId: ctx.user.id,
          data: { from: existing.status.name, to: newStatus.name },
        },
      })

      return customer
    }),

  assign: tenantProcedure
    .input(z.object({ id: z.string(), assignedToId: z.string().nullable() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.customer.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      })
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' })

      const customer = await prisma.customer.update({
        where: { id: input.id },
        data: { assignedToId: input.assignedToId },
      })

      await prisma.activity.create({
        data: {
          type: 'ASSIGNMENT',
          tenantId: ctx.tenantId,
          customerId: input.id,
          actorId: ctx.user.id,
          data: { assignedToId: input.assignedToId },
        },
      })

      return customer
    }),

  bulkUpdate: tenantProcedure
    .input(z.object({
      ids: z.array(z.string()).min(1),
      statusId: z.string().optional(),
      assignedToId: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { ids, ...data } = input
      const result = await prisma.customer.updateMany({
        where: { id: { in: ids }, tenantId: ctx.tenantId },
        data,
      })
      return { updated: result.count }
    }),

  delete: tenantProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.customer.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      })
      if (!existing) throw new TRPCError({ code: 'NOT_FOUND' })
      return prisma.customer.delete({ where: { id: input.id } })
    }),
})
