import { router } from '../lib/trpc'
import { authRouter } from './auth'
import { tenantRouter } from './tenant'

export const appRouter = router({
  auth: authRouter,
  tenant: tenantRouter,
})

export type AppRouter = typeof appRouter
