import { prisma } from '@catalyst/db'
import { createTenantSchema, inviteMemberSchema, updateTenantSchema } from '@catalyst/validation'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { adminProcedure, protectedProcedure, router, tenantProcedure } from '../lib/trpc'

const DEFAULT_STATUSES: Record<string, Array<{ name: string; color: string; isClosed: boolean }>> =
  {
    en: [
      { name: 'New', color: '#3B82F6', isClosed: false },
      { name: 'Contacted', color: '#8B5CF6', isClosed: false },
      { name: 'Qualified', color: '#F59E0B', isClosed: false },
      { name: 'Proposal', color: '#F97316', isClosed: false },
      { name: 'Won', color: '#22C55E', isClosed: true },
      { name: 'Lost', color: '#EF4444', isClosed: true },
    ],
    he: [
      { name: 'חדש', color: '#3B82F6', isClosed: false },
      { name: 'יצרנו קשר', color: '#8B5CF6', isClosed: false },
      { name: 'מתאים', color: '#F59E0B', isClosed: false },
      { name: 'הצעה', color: '#F97316', isClosed: false },
      { name: 'סגור', color: '#22C55E', isClosed: true },
      { name: 'אבוד', color: '#EF4444', isClosed: true },
    ],
  }

export const tenantRouter = router({
  create: protectedProcedure
    .input(createTenantSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.tenant.findUnique({ where: { slug: input.slug } })
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'Slug already taken' })
      }

      const tenant = await prisma.tenant.create({
        data: {
          name: input.name,
          slug: input.slug,
          language: input.language,
        },
      })

      await prisma.tenantMember.create({
        data: {
          userId: ctx.user.id,
          tenantId: tenant.id,
          role: 'OWNER',
          joinedAt: new Date(),
        },
      })

      const statuses = DEFAULT_STATUSES[input.language] ?? DEFAULT_STATUSES.en!
      await Promise.all(
        statuses.map((status, index) =>
          prisma.customerStatus.create({
            data: {
              ...status,
              tenantId: tenant.id,
              order: index,
              isDefault: index === 0,
            },
          })
        ),
      )

      return tenant
    }),

  getCurrent: tenantProcedure.query(async ({ ctx }) => {
    return prisma.tenant.findUniqueOrThrow({ where: { id: ctx.tenantId } })
  }),

  update: adminProcedure
    .input(updateTenantSchema)
    .mutation(async ({ ctx, input }) => {
      const { settings, ...rest } = input
      return prisma.tenant.update({
        where: { id: ctx.tenantId },
        data: {
          ...rest,
          ...(settings !== undefined && { settings: settings as Record<string, unknown> as never }),
        },
      })
    }),

  getMembers: tenantProcedure.query(async ({ ctx }) => {
    return prisma.tenantMember.findMany({
      where: { tenantId: ctx.tenantId },
      include: { user: { select: { id: true, name: true, email: true, image: true } } },
    })
  }),

  invite: adminProcedure
    .input(inviteMemberSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({ where: { email: input.email } })
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' })
      }

      const existing = await prisma.tenantMember.findUnique({
        where: { userId_tenantId: { userId: user.id, tenantId: ctx.tenantId } },
      })
      if (existing) {
        throw new TRPCError({ code: 'CONFLICT', message: 'User is already a member' })
      }

      return prisma.tenantMember.create({
        data: {
          userId: user.id,
          tenantId: ctx.tenantId,
          role: input.role,
          joinedAt: new Date(),
        },
      })
    }),

  removeMember: adminProcedure
    .input(z.object({ memberId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const member = await prisma.tenantMember.findFirst({
        where: { id: input.memberId, tenantId: ctx.tenantId },
      })

      if (!member) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Member not found' })
      }

      if (member.role === 'OWNER') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Cannot remove the owner' })
      }

      return prisma.tenantMember.delete({ where: { id: input.memberId } })
    }),
})
