import { z } from 'zod'

export const createCustomerStatusSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color').default('#6B7280'),
  order: z.number().int().min(0),
  isDefault: z.boolean().default(false),
  isClosed: z.boolean().default(false),
  autoMessage: z.string().max(1000).optional(),
})

export const updateCustomerStatusSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex color').optional(),
  order: z.number().int().min(0).optional(),
  isDefault: z.boolean().optional(),
  isClosed: z.boolean().optional(),
  autoMessage: z.string().max(1000).nullable().optional(),
})

export const reorderStatusesSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
})

export type CreateCustomerStatusInput = z.infer<typeof createCustomerStatusSchema>
export type UpdateCustomerStatusInput = z.infer<typeof updateCustomerStatusSchema>
export type ReorderStatusesInput = z.infer<typeof reorderStatusesSchema>
