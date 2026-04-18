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
  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8').trim()
  }

  // For PDF and DOCX, return raw text extraction
  // In production, use dedicated libraries (pdf-parse, mammoth)
  // For now, treat as plain text if possible
  return buffer.toString('utf-8').trim()
}
