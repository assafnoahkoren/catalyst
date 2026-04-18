import { auth } from '@catalyst/auth/server'
import type { Session } from '@catalyst/auth/server'
import { startScheduler } from '@catalyst/automation'
import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requestLogger } from './middleware/logger'
import { rateLimiter } from './middleware/rate-limit'
import { sessionMiddleware } from './middleware/session'
import { appRouter } from './routers'
import { fileUpload } from './routes/file-upload'
import { webhookIngestion } from './routes/webhook-ingestion'
import { whatsappWebhook } from './routes/whatsapp-webhook'

const app = new Hono<{
  Variables: {
    user: Session['user'] | null
    session: Session['session'] | null
    traceId: string
  }
}>()

// Global middleware
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  }),
)

app.use('*', requestLogger)
app.use('*', sessionMiddleware)

// Health check
app.get('/health', (c) => c.json({ status: 'ok' }))

// Better Auth handler (rate limited: 10 req/min per IP)
app.use('/api/auth/*', rateLimiter(10, 60_000))
app.on(['POST', 'GET'], '/api/auth/**', (c) => auth.handler(c.req.raw))

// File upload
app.route('/api/upload', fileUpload)

// Webhook ingestion
app.route('/api/webhook', webhookIngestion)

// WhatsApp webhook
app.route('/api/whatsapp', whatsappWebhook)

// tRPC handler
app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext: (_opts, c) => ({
      user: c.get('user'),
      session: c.get('session'),
    }),
  }),
)

// Start automation scheduler (skip during tests)
if (process.env.NODE_ENV !== 'test') {
  startScheduler(30_000) // Poll every 30 seconds
}

const port = Number(process.env.PORT ?? 3001)

export default {
  port,
  fetch: app.fetch,
}
