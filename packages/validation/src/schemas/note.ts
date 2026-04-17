import { z } from 'zod'

export const createNoteSchema = z.object({
  customerId: z.string(),
  body: z.string().min(1).max(5000),
})

export const updateNoteSchema = z.object({
  body: z.string().min(1).max(5000),
})

export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
