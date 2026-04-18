import { embedBatch } from '@catalyst/ai'
import { prisma } from '@catalyst/db'
import { chunkText, parseFile } from '@catalyst/knowledge'
import { Hono } from 'hono'

export const fileUpload = new Hono()

fileUpload.post('/knowledge/upload', async (c) => {
  // Get session from Better Auth cookie
  const sessionRes = await fetch(
    `${process.env.BETTER_AUTH_URL ?? 'http://localhost:3001'}/api/auth/get-session`,
    {
      headers: { cookie: c.req.header('cookie') ?? '' },
    },
  )
  const sessionData = await sessionRes.json() as { session?: { userId: string } } | null
  if (!sessionData?.session) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  const membership = await prisma.tenantMember.findFirst({
    where: { userId: sessionData.session.userId },
  })
  if (!membership) {
    return c.json({ error: 'No tenant' }, 403)
  }

  const body = await c.req.parseBody()
  const file = body.file
  if (!file || typeof file === 'string') {
    return c.json({ error: 'No file uploaded' }, 400)
  }

  const title = typeof body.title === 'string' ? body.title : file.name
  const buffer = Buffer.from(await file.arrayBuffer())
  const mimeType = file.type || 'text/plain'

  try {
    // Parse file content
    const content = await parseFile(buffer, mimeType)

    // Create entry
    const entry = await prisma.knowledgeEntry.create({
      data: {
        title,
        content,
        type: 'FILE',
        tenantId: membership.tenantId,
      },
    })

    // Chunk and embed
    const chunks = chunkText(content)
    if (chunks.length > 0) {
      const vectors = await embedBatch(chunks.map((ch) => ch.text))
      const { upsertVectors } = await import('@catalyst/knowledge')
      await upsertVectors(
        chunks.map((chunk, i) => ({
          id: `${entry.id}-${chunk.index}`,
          vector: vectors[i]!,
          payload: {
            tenantId: membership.tenantId,
            entryId: entry.id,
            chunkIndex: chunk.index,
            text: chunk.text,
          },
        })),
      )
    }

    await prisma.knowledgeEntry.update({
      where: { id: entry.id },
      data: { chunkCount: chunks.length },
    })

    return c.json({ success: true, entryId: entry.id, chunkCount: chunks.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return c.json({ error: message }, 500)
  }
})
