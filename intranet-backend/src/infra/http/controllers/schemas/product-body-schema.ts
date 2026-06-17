import { z } from 'zod'

export const createProductBodySchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number(),
  stockQuantity: z.number().int(),
  supplier: z.string(),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
})

export type CreateProductBodySchema = z.infer<typeof createProductBodySchema>

export const editProductBodySchema = createProductBodySchema
  .partial()
  .extend({ active: z.boolean().optional() })

export type EditProductBodySchema = z.infer<typeof editProductBodySchema>

export const productQuerySchema = z.object({
  code: z.string().optional(),
  name: z.string().optional(),
  category: z.string().optional(),
  supplier: z.string().optional(),
})

export type ProductQuerySchema = z.infer<typeof productQuerySchema>
