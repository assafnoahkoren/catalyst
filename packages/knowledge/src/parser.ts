import mammoth from 'mammoth'

export async function parseText(content: string): Promise<string> {
  return content.trim()
}

export async function parseUrl(url: string): Promise<string> {
  const response = await fetch(url)
  const html = await response.text()
  // Strip HTML tags for basic text extraction
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function parseFile(buffer: Buffer, mimeType: string): Promise<string> {
  try {
    if (mimeType === 'text/plain') {
      return buffer.toString('utf-8').trim()
    }

    if (mimeType === 'application/pdf') {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore — pdf-parse v1 has no type declarations
      const pdfParse = (await import('pdf-parse')).default as (
        buf: Buffer,
      ) => Promise<{ text: string }>
      const data = await pdfParse(buffer)
      return data.text.trim()
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      || mimeType === 'application/msword'
    ) {
      const result = await mammoth.extractRawText({ buffer })
      return result.value.trim()
    }

    // Fallback: try as plain text
    return buffer.toString('utf-8').trim()
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new Error(`Failed to parse file (${mimeType}): ${message}`)
  }
}
