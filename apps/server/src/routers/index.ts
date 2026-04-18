import { router } from '../lib/trpc'
import { authRouter } from './auth'
import { customerRouter } from './customer'
import { customerStatusRouter } from './customer-status'
import { tenantRouter } from './tenant'

export const appRouter = router({
  auth: authRouter,
  tenant: tenantRouter,
  customer: customerRouter,
  customerStatus: customerStatusRouter,
})

export type AppRouter = typeof appRouter
