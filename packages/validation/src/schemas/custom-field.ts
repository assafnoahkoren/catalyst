import { z } from 'zod'

export const createCustomFieldSchema = z.object({
  name: z.string().min(1).max(100),
  key: z.string().min(1).max(50).regex(
    /^[a-zA-Z][a-zA-Z0-9_]*$/,
    'Key must start with a letter and contain only alphanumeric characters and underscores',
  ),
  type: z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'BOOLEAN', 'URL', 'PHONE'])
    .default('TEXT'),
  options: z.array(z.string()).default([]),
  isRequired: z.boolean().default(false),
  order: z.number().int().min(0).default(0),
})

export const updateCustomFieldSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['TEXT', 'NUMBER', 'DATE', 'SELECT', 'MULTI_SELECT', 'BOOLEAN', 'URL', 'PHONE'])
    .optional(),
  options: z.array(z.string()).optional(),
  isRequired: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
})

export type CreateCustomFieldInput = z.infer<typeof createCustomFieldSchema>
export type UpdateCustomFieldInput = z.infer<typeof updateCustomFieldSchema>
