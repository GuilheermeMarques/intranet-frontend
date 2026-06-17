import { z } from 'zod'

export const createOrderBodySchema = z.object({
  clientId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int(),
      unitPrice: z.number().optional(),
    }),
  ),
  shippingCost: z.number().optional(),
  notes: z.string().optional(),
})

export type CreateOrderBodySchema = z.infer<typeof createOrderBodySchema>

export const editOrderBodySchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int(),
        unitPrice: z.number().optional(),
      }),
    )
    .optional(),
  shippingCost: z.number().optional(),
  notes: z.string().optional(),
})

export type EditOrderBodySchema = z.infer<typeof editOrderBodySchema>

export const statusBodySchema = z.object({
  status: z.enum(['pending', 'shipped', 'delivered', 'canceled']),
})

export type StatusBodySchema = z.infer<typeof statusBodySchema>

export const orderQuerySchema = z.object({
  orderCode: z.string().optional(),
  clientName: z.string().optional(),
  status: z.string().optional(),
})

export type OrderQuerySchema = z.infer<typeof orderQuerySchema>
