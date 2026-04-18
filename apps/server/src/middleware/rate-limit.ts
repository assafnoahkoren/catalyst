import type { Context, Next } from 'hono'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key)
  }
}, 5 * 60 * 1000)

export function rateLimiter(maxRequests: number, windowMs: number) {
  return async (c: Context, next: Next) => {
    const ip = c.req.header('x-forwarded-for')
      ?? c.req.header('x-real-ip')
      ?? 'unknown'
    const key = `${ip}:${c.req.path}`
    const now = Date.now()

    const entry = store.get(key)
    if (entry && entry.resetAt > now) {
      entry.count++
      if (entry.count > maxRequests) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
        c.header('Retry-After', String(retryAfter))
        return c.json({ error: 'Too many requests' }, 429)
      }
    } else {
      store.set(key, { count: 1, resetAt: now + windowMs })
    }

    await next()
  }
}
