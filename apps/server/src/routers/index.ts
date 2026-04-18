import { router } from '../lib/trpc'
import { activityRouter } from './activity'
import { authRouter } from './auth'
import { customFieldRouter } from './custom-field'
import { customerRouter } from './customer'
import { customerStatusRouter } from './customer-status'
import { knowledgeRouter } from './knowledge'
import { noteRouter } from './note'
import { tenantRouter } from './tenant'

export const appRouter = router({
  auth: authRouter,
  tenant: tenantRouter,
  customer: customerRouter,
  customerStatus: customerStatusRouter,
  customField: customFieldRouter,
  note: noteRouter,
  activity: activityRouter,
  knowledge: knowledgeRouter,
})

export type AppRouter = typeof appRouter
