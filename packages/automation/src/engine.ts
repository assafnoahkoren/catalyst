import { prisma } from '@catalyst/db'
import type { AutomationFlow } from '@catalyst/db'
import { executeAction } from './actions'
import type { StepConfig } from './actions'

export async function executeFlow(
  flow: AutomationFlow,
  customerId: string,
): Promise<void> {
  const steps = flow.steps as unknown as StepConfig[]

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i]!

    // Handle WAIT by scheduling
    if (step.action === 'WAIT') {
      const delayMs = (step.config.delayMs as number) ?? 0
      await prisma.scheduledTask.create({
        data: {
          flowId: flow.id,
          customerId,
          stepIndex: i + 1,
          executeAt: new Date(Date.now() + delayMs),
          status: 'PENDING',
        },
      })
      return // Stop execution, scheduler will resume
    }

    const result = await executeAction(step, flow.tenantId, customerId)

    await prisma.automationLog.create({
      data: {
        flowId: flow.id,
        customerId,
        stepIndex: i,
        status: result.success ? 'SUCCESS' : 'FAILED',
        result: { message: result.result } as never,
      },
    })

    if (!result.success) return // Stop on failure
  }
}
