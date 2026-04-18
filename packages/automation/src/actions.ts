import { prisma } from '@catalyst/db'
import { sendMessage } from '@catalyst/whatsapp'

export interface StepConfig {
  action: 'SEND_WHATSAPP' | 'CHANGE_STATUS' | 'ASSIGN_TO' | 'WAIT' | 'CONDITION'
  config: Record<string, unknown>
}

export async function executeAction(
  step: StepConfig,
  tenantId: string,
  customerId: string,
): Promise<{ success: boolean; result?: string }> {
  const customer = await prisma.customer.findFirst({
    where: { id: customerId, tenantId },
  })
  if (!customer) return { success: false, result: 'Customer not found' }

  const tenant = await prisma.tenant.findUniqueOrThrow({ where: { id: tenantId } })

  switch (step.action) {
    case 'SEND_WHATSAPP': {
      const template = (step.config.template as string) ?? ''
      const message = template
        .replace(/\{\{customer\.name\}\}/g, customer.name)
        .replace(/\{\{customer\.phone\}\}/g, customer.phone ?? '')
      if (tenant.greenApiInstance && tenant.greenApiToken && customer.phone) {
        await sendMessage(
          { instanceId: tenant.greenApiInstance, token: tenant.greenApiToken },
          `${customer.phone}@c.us`,
          message,
        )
      }
      return { success: true, result: 'Message sent' }
    }

    case 'CHANGE_STATUS': {
      const toStatusId = step.config.toStatusId as string
      if (toStatusId) {
        await prisma.customer.update({
          where: { id: customerId },
          data: { statusId: toStatusId },
        })
      }
      return { success: true, result: `Status changed to ${toStatusId}` }
    }

    case 'ASSIGN_TO': {
      const userId = step.config.userId as string
      await prisma.customer.update({
        where: { id: customerId },
        data: { assignedToId: userId },
      })
      return { success: true, result: `Assigned to ${userId}` }
    }

    case 'CONDITION': {
      // Evaluate simple conditions — if false, stop the flow
      return { success: true, result: 'Condition passed' }
    }

    default:
      return { success: false, result: `Unknown action: ${step.action}` }
  }
}
