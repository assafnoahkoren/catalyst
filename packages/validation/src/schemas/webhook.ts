import { z } from 'zod'

export const createWebhookEndpointSchema = z.object({
  fieldMapping: z.record(z.string(), z.string()).default({}),
})

export const updateWebhookEndpointSchema = z.object({
  fieldMapping: z.record(z.string(), z.string()).optional(),
  isActive: z.boolean().optional(),
})

export type CreateWebhookEndpointInput = z.infer<typeof createWebhookEndpointSchema>
export type UpdateWebhookEndpointInput = z.infer<typeof updateWebhookEndpointSchema>
