const DEFAULT_CHUNK_SIZE = 500 // approximate tokens (~2000 chars)
const DEFAULT_OVERLAP = 50 // overlap in tokens

export interface Chunk {
  text: string
  index: number
}

export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP,
): Chunk[] {
  const charSize = chunkSize * 4 // rough char-to-token ratio
  const charOverlap = overlap * 4
  const chunks: Chunk[] = []

  let start = 0
  let index = 0

  while (start < text.length) {
    let end = start + charSize

    // Try to break at a sentence boundary
    if (end < text.length) {
      const lastPeriod = text.lastIndexOf('.', end)
      const lastNewline = text.lastIndexOf('\n', end)
      const breakPoint = Math.max(lastPeriod, lastNewline)
      if (breakPoint > start + charSize / 2) {
        end = breakPoint + 1
      }
    }

    const chunkText = text.slice(start, end).trim()
    if (chunkText.length > 0) {
      chunks.push({ text: chunkText, index })
      index++
    }

    start = end - charOverlap
  }

  return chunks
}
