import { createLogger } from '@catalyst/logger'
import { randomUUID } from 'crypto'
import { createMiddleware } from 'hono/factory'

const log = createLogger('server')

export const requestLogger = createMiddleware(async (c, next) => {
  const traceId = randomUUID()
  c.set('traceId', traceId)

  const start = Date.now()
  log.info({ traceId, method: c.req.method, path: c.req.path }, 'request started')

  await next()

  const duration = Date.now() - start
  log.info(
    { traceId, method: c.req.method, path: c.req.path, status: c.res.status, duration },
    'request completed',
  )
})
