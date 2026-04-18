import { embedBatch } from '@catalyst/ai'
import { prisma } from '@catalyst/db'
import { chunkText, deleteByEntryId, parseText, parseUrl, upsertVectors } from '@catalyst/knowledge'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { router, tenantProcedure } from '../lib/trpc'

export const knowledgeRouter = router({
  list: tenantProcedure.query(async ({ ctx }) => {
    return prisma.knowledgeEntry.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { createdAt: 'desc' },
    })
  }),

  createText: tenantProcedure
    .input(z.object({
      title: z.string().min(1),
      content: z.string().min(1),
      type: z.enum(['TEXT', 'QA_PAIR']).default('TEXT'),
      question: z.string().optional(),
      answer: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const entry = await prisma.knowledgeEntry.create({
        data: {
          title: input.title,
          content: input.content,
          type: input.type,
          question: input.question,
          answer: input.answer,
          tenantId: ctx.tenantId,
        },
      })

      const textToEmbed = input.type === 'QA_PAIR'
        ? `${input.question}\n${input.answer}`
        : input.content

      const chunks = chunkText(await parseText(textToEmbed))
      const vectors = await embedBatch(chunks.map((c) => c.text))

      await upsertVectors(
        chunks.map((chunk, i) => ({
          id: `${entry.id}-${chunk.index}`,
          vector: vectors[i]!,
          payload: {
            tenantId: ctx.tenantId,
            entryId: entry.id,
            chunkIndex: chunk.index,
            text: chunk.text,
          },
        })),
      )

      await prisma.knowledgeEntry.update({
        where: { id: entry.id },
        data: { chunkCount: chunks.length },
      })

      return entry
    }),

  addUrl: tenantProcedure
    .input(z.object({ title: z.string().min(1), url: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const content = await parseUrl(input.url)

      const entry = await prisma.knowledgeEntry.create({
        data: {
          title: input.title,
          content,
          type: 'URL',
          sourceUrl: input.url,
          tenantId: ctx.tenantId,
        },
      })

      const chunks = chunkText(content)
      const vectors = await embedBatch(chunks.map((c) => c.text))

      await upsertVectors(
        chunks.map((chunk, i) => ({
          id: `${entry.id}-${chunk.index}`,
          vector: vectors[i]!,
          payload: {
            tenantId: ctx.tenantId,
            entryId: entry.id,
            chunkIndex: chunk.index,
            text: chunk.text,
          },
        })),
      )

      await prisma.knowledgeEntry.update({
        where: { id: entry.id },
        data: { chunkCount: chunks.length },
      })

      return entry
    }),

  delete: tenantProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const entry = await prisma.knowledgeEntry.findFirst({
        where: { id: input.id, tenantId: ctx.tenantId },
      })
      if (!entry) throw new TRPCError({ code: 'NOT_FOUND' })

      await deleteByEntryId(entry.id)
      return prisma.knowledgeEntry.delete({ where: { id: input.id } })
    }),
})
