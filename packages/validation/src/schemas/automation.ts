import { z } from 'zod'

const triggerConfigSchema = z.object({
  type: z.enum(['STATUS_CHANGE', 'NEW_CUSTOMER', 'MESSAGE_RECEIVED', 'TIME_BASED']),
  config: z.record(z.string(), z.unknown()).default({}),
})

const stepSchema = z.object({
  action: z.enum(['SEND_WHATSAPP', 'CHANGE_STATUS', 'ASSIGN_TO', 'WAIT', 'CONDITION']),
  config: z.record(z.string(), z.unknown()).default({}),
})

export const createAutomationFlowSchema = z.object({
  name: z.string().min(1).max(100),
  trigger: triggerConfigSchema,
  steps: z.array(stepSchema).min(1),
  isActive: z.boolean().default(false),
})

export const updateAutomationFlowSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  trigger: triggerConfigSchema.optional(),
  steps: z.array(stepSchema).min(1).optional(),
  isActive: z.boolean().optional(),
})

export type CreateAutomationFlowInput = z.infer<typeof createAutomationFlowSchema>
export type UpdateAutomationFlowInput = z.infer<typeof updateAutomationFlowSchema>
