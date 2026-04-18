import { prisma } from '@catalyst/db'
import { initTRPC, TRPCError } from '@trpc/server'
import type { Context } from '../middleware/context'

const t = initTRPC.context<Context>().create()

export const router = t.router
export const publicProcedure = t.procedure

export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.session) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      user: ctx.user,
      session: ctx.session,
    },
  })
})

export const tenantProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const membership = await prisma.tenantMember.findFirst({
    where: { userId: ctx.user.id },
  })

  if (!membership) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User is not a member of any tenant',
    })
  }

  return next({
    ctx: {
      ...ctx,
      tenantId: membership.tenantId,
      memberRole: membership.role as string,
    },
  })
})

export const adminProcedure = tenantProcedure.use(async ({ ctx, next }) => {
  if (ctx.memberRole === 'MEMBER') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Admin or owner access required',
    })
  }
  return next({ ctx })
})
