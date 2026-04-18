import { auth } from '@catalyst/auth/server'
import type { Session } from '@catalyst/auth/server'
import { trpcServer } from '@hono/trpc-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { requestLogger } from './middleware/logger'
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

// Better Auth handler
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

const port = Number(process.env.PORT ?? 3001)

export default {
  port,
  fetch: app.fetch,
}
