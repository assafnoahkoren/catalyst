import { z } from 'zod'

export const createTenantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z.string().min(2).max(50).regex(
    /^[a-z0-9-]+$/,
    'Slug must be lowercase alphanumeric with hyphens',
  ),
  language: z.string().min(2).max(5).default('en'),
})

export const updateTenantSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  language: z.string().min(2).max(5).optional(),
  settings: z.record(z.string(), z.unknown()).optional(),
  greenApiInstance: z.string().optional(),
  greenApiToken: z.string().optional(),
})

export const inviteMemberSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER']),
})

export type CreateTenantInput = z.infer<typeof createTenantSchema>
export type UpdateTenantInput = z.infer<typeof updateTenantSchema>
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>
