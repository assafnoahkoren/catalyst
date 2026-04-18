import { prisma } from '@catalyst/db'
import { createNoteSchema, updateNoteSchema } from '@catalyst/validation'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, tenantProcedure } from '../lib/trpc'

export const noteRouter = router({
  list: tenantProcedure
    .input(z.object({ customerId: z.string() }))
    .query(async ({ ctx, input }) => {
      return prisma.note.findMany({
        where: { customerId: input.customerId, tenantId: ctx.tenantId },
        orderBy: { createdAt: 'desc' },
      })
    }),

  create: tenantProcedure
    .input(createNoteSchema)
    .mutation(async ({ ctx, input }) => {
      const note = await prisma.note.create({
        data: {
          body: input.body,
          customerId: input.customerId,
          tenantId: ctx.tenantId,
          authorId: ctx.user.id,
        },
      })

      await prisma.activity.create({
        data: {
          type: 'NOTE',
          tenantId: ctx.tenantId,
          customerId: input.customerId,
          actorId: ctx.user.id,
          data: { noteId: note.id },
        },
      })

      return note
    }),

  update: tenantProcedure
    .input(z.object({ id: z.string() }).merge(updateNoteSchema))
    .mutation(async ({ ctx, input }) => {
      const note = await prisma.note.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      })
      if (!note) throw new TRPCError({ code: 'NOT_FOUND' })
      return prisma.note.update({
        where: { id: input.id },
        data: { body: input.body },
      })
    }),

  delete: tenantProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const note = await prisma.note.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      })
      if (!note) throw new TRPCError({ code: 'NOT_FOUND' })
      return prisma.note.delete({ where: { id: input.id } })
    }),
})
