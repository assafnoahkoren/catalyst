import { embedText } from '@catalyst/ai'
import { searchVectors } from './vectorStore'
import type { SearchResult } from './vectorStore'

export interface RagResult {
  context: string
  topScore: number
  chunks: SearchResult[]
}

export async function retrieveContext(
  query: string,
  tenantId: string,
  limit = 5,
): Promise<RagResult> {
  const queryVector = await embedText(query)
  const chunks = await searchVectors(queryVector, tenantId, limit)
  const topScore = chunks.length > 0 ? chunks[0]!.score : 0
  const context = chunks.map((c) => c.text).join('\n\n---\n\n')

  return { context, topScore, chunks }
}
