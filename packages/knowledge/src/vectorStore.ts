import { QdrantClient } from '@qdrant/js-client-rest'

const COLLECTION_NAME = 'knowledge'
const VECTOR_SIZE = 1536 // text-embedding-3-small dimensions

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL ?? 'http://localhost:6333',
})

export async function ensureCollection(): Promise<void> {
  const collections = await qdrant.getCollections()
  const exists = collections.collections.some((c) => c.name === COLLECTION_NAME)
  if (!exists) {
    await qdrant.createCollection(COLLECTION_NAME, {
      vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
    })
  }
}

export interface VectorPoint {
  id: string
  vector: number[]
  payload: {
    tenantId: string
    entryId: string
    chunkIndex: number
    text: string
  }
}

export async function upsertVectors(points: VectorPoint[]): Promise<void> {
  await ensureCollection()
  await qdrant.upsert(COLLECTION_NAME, {
    wait: true,
    points: points.map((p) => ({
      id: p.id,
      vector: p.vector,
      payload: p.payload,
    })),
  })
}

export interface SearchResult {
  id: string
  score: number
  text: string
  entryId: string
  chunkIndex: number
}

export async function searchVectors(
  vector: number[],
  tenantId: string,
  limit = 5,
): Promise<SearchResult[]> {
  await ensureCollection()
  const results = await qdrant.search(COLLECTION_NAME, {
    vector,
    limit,
    filter: {
      must: [{ key: 'tenantId', match: { value: tenantId } }],
    },
    with_payload: true,
  })

  return results.map((r) => ({
    id: typeof r.id === 'string' ? r.id : String(r.id),
    score: r.score,
    text: (r.payload as Record<string, unknown>)?.text as string ?? '',
    entryId: (r.payload as Record<string, unknown>)?.entryId as string ?? '',
    chunkIndex: (r.payload as Record<string, unknown>)?.chunkIndex as number ?? 0,
  }))
}

export async function deleteByEntryId(entryId: string): Promise<void> {
  await qdrant.delete(COLLECTION_NAME, {
    wait: true,
    filter: {
      must: [{ key: 'entryId', match: { value: entryId } }],
    },
  })
}
