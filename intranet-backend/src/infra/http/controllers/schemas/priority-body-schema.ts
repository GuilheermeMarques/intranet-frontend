import { z } from 'zod'

export const createPriorityBodySchema = z.object({
  name: z.string(),
  color: z.string(),
  level: z.number().int(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type CreatePriorityBodySchema = z.infer<typeof createPriorityBodySchema>

export const editPriorityBodySchema = createPriorityBodySchema.partial()

export type EditPriorityBodySchema = z.infer<typeof editPriorityBodySchema>
