import { z } from 'zod'

export const fetchRepresentativesQuerySchema = z.object({
  name: z.string().optional(),
  region: z.string().optional(),
  status: z.string().optional(),
})

export type FetchRepresentativesQuerySchema = z.infer<
  typeof fetchRepresentativesQuerySchema
>
