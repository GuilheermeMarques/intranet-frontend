import { z } from 'zod'

export const createClientBodySchema = z.object({
  name: z.string(),
  document: z.string(),
  zipCode: z.string(),
  street: z.string(),
  city: z.string(),
  state: z.string(),
  neighborhood: z.string(),
  number: z.string(),
  complement: z.string(),
  email: z.string().email(),
  phone: z.string(),
  instagram: z.string(),
})

export type CreateClientBodySchema = z.infer<typeof createClientBodySchema>

export const editClientBodySchema = createClientBodySchema.partial()

export type EditClientBodySchema = z.infer<typeof editClientBodySchema>

export const fetchClientsQuerySchema = z.object({
  code: z.string().optional(),
  name: z.string().optional(),
  city: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export type FetchClientsQuerySchema = z.infer<typeof fetchClientsQuerySchema>
