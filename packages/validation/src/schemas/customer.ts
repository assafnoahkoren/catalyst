import { z } from 'zod'

export const createCustomerSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  statusId: z.string(),
  source: z.enum(['WEBHOOK', 'MANUAL', 'FACEBOOK', 'IMPORT']).default('MANUAL'),
  assignedToId: z.string().optional(),
  customFields: z.record(z.string(), z.unknown()).default({}),
  tags: z.array(z.string()).default([]),
})

export const updateCustomerSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.string().email().optional(),
  phone: z.string().max(20).optional(),
  statusId: z.string().optional(),
  assignedToId: z.string().nullable().optional(),
  customFields: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
})

export const changeCustomerStatusSchema = z.object({
  statusId: z.string(),
})

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type ChangeCustomerStatusInput = z.infer<typeof changeCustomerStatusSchema>
