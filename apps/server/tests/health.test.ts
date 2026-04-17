import { describe, expect, it } from 'vitest'
import app from '../src/index'

describe('health endpoint', () => {
  it('returns ok', async () => {
    const res = await app.fetch(new Request('http://localhost/health'))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ status: 'ok' })
  })
})
