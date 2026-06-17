import { z } from 'zod'

export const createBudgetBodySchema = z.object({
  clientId: z.string(),
  responsibleId: z.string(),
  validityDate: z.coerce.date().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int(),
      unitPrice: z.number().optional(),
    }),
  ),
})

export type CreateBudgetBodySchema = z.infer<typeof createBudgetBodySchema>

export const editBudgetBodySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected', 'expired']).optional(),
  validityDate: z.coerce.date().optional(),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int(),
        unitPrice: z.number().optional(),
      }),
    )
    .optional(),
})

export type EditBudgetBodySchema = z.infer<typeof editBudgetBodySchema>

export const budgetQuerySchema = z.object({
  budgetNumber: z.string().optional(),
  clientId: z.string().optional(),
  responsibleId: z.string().optional(),
  status: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export type BudgetQuerySchema = z.infer<typeof budgetQuerySchema>
