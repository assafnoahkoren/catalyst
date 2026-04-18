import { prisma } from '@catalyst/db'

export interface TriggerConfig {
  type: 'STATUS_CHANGE' | 'NEW_CUSTOMER' | 'MESSAGE_RECEIVED' | 'TIME_BASED'
  config: Record<string, unknown>
}

export interface TriggerContext {
  tenantId: string
  customerId: string
  type: string
  data?: Record<string, unknown>
}

export async function findMatchingFlows(ctx: TriggerContext) {
  const flows = await prisma.automationFlow.findMany({
    where: { tenantId: ctx.tenantId, isActive: true },
  })

  return flows.filter((flow) => {
    const trigger = flow.trigger as unknown as TriggerConfig
    if (trigger.type !== ctx.type) return false

    if (trigger.type === 'STATUS_CHANGE' && ctx.data) {
      const config = trigger.config as { toStatusId?: string; fromStatusId?: string }
      if (config.toStatusId && config.toStatusId !== ctx.data.toStatusId) return false
      if (config.fromStatusId && config.fromStatusId !== ctx.data.fromStatusId) return false
    }

    if (trigger.type === 'NEW_CUSTOMER' && ctx.data) {
      const config = trigger.config as { source?: string }
      if (config.source && config.source !== ctx.data.source) return false
    }

    return true
  })
}
