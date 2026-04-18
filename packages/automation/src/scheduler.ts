import { prisma } from '@catalyst/db'
import { executeAction } from './actions'
import type { StepConfig } from './actions'

let intervalId: ReturnType<typeof setInterval> | null = null

export function startScheduler(pollIntervalMs = 60_000): void {
  if (intervalId) return
  intervalId = setInterval(processDueTasks, pollIntervalMs)
  processDueTasks() // Run immediately on start
}

export function stopScheduler(): void {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

async function processDueTasks(): Promise<void> {
  const dueTasks = await prisma.scheduledTask.findMany({
    where: {
      status: 'PENDING',
      executeAt: { lte: new Date() },
    },
    include: { flow: true },
  })

  for (const task of dueTasks) {
    await prisma.scheduledTask.update({
      where: { id: task.id },
      data: { status: 'RUNNING' },
    })

    try {
      const steps = task.flow.steps as unknown as StepConfig[]
      // Resume from the scheduled step index
      for (let i = task.stepIndex; i < steps.length; i++) {
        const step = steps[i]!

        if (step.action === 'WAIT') {
          const delayMs = (step.config.delayMs as number) ?? 0
          await prisma.scheduledTask.create({
            data: {
              flowId: task.flowId,
              customerId: task.customerId,
              stepIndex: i + 1,
              executeAt: new Date(Date.now() + delayMs),
              status: 'PENDING',
            },
          })
          break
        }

        const result = await executeAction(step, task.flow.tenantId, task.customerId)

        await prisma.automationLog.create({
          data: {
            flowId: task.flowId,
            customerId: task.customerId,
            stepIndex: i,
            status: result.success ? 'SUCCESS' : 'FAILED',
            result: { message: result.result } as never,
          },
        })

        if (!result.success) break
      }

      await prisma.scheduledTask.update({
        where: { id: task.id },
        data: { status: 'COMPLETED' },
      })
    } catch {
      await prisma.scheduledTask.update({
        where: { id: task.id },
        data: { status: 'FAILED' },
      })
    }
  }
}
