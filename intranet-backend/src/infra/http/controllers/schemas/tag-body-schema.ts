import { z } from 'zod'

export const createTagBodySchema = z.object({
  name: z.string(),
  color: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  isActive: z.boolean().optional(),
})

export type CreateTagBodySchema = z.infer<typeof createTagBodySchema>

export const editTagBodySchema = createTagBodySchema.partial()

export type EditTagBodySchema = z.infer<typeof editTagBodySchema>
