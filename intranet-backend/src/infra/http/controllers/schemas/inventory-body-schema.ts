import { z } from 'zod'

export const inventoryMovementQuerySchema = z.object({
  productCode: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export type InventoryMovementQuerySchema = z.infer<
  typeof inventoryMovementQuerySchema
>

export const createInventoryMovementBodySchema = z.object({
  productCode: z.string(),
  description: z.string(),
  quantity: z.number().int(),
  type: z.enum(['inbound', 'outbound']),
  reason: z.string().optional(),
  handledBy: z.string().optional(),
  notes: z.string().optional(),
  occurredAt: z.coerce.date().optional(),
})

export type CreateInventoryMovementBodySchema = z.infer<
  typeof createInventoryMovementBodySchema
>
