import { getOpenAI } from './client'

const EMBEDDING_MODEL = 'text-embedding-3-small'
const MAX_BATCH_SIZE = 100

export async function embedText(text: string): Promise<number[]> {
  const response = await getOpenAI().embeddings.create({
    model: EMBEDDING_MODEL,
    input: text,
  })
  return response.data[0]!.embedding
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  const results: number[][] = []

  for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
    const batch = texts.slice(i, i + MAX_BATCH_SIZE)
    const response = await getOpenAI().embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch,
    })
    results.push(...response.data.map((d) => d.embedding))
  }

  return results
}
