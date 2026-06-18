import { z } from 'zod'

export const createTicketBodySchema = z.object({
  title: z.string(),
  description: z.string(),
  priorityId: z.string(),
  assignee: z.string(),
  reporter: z.string(),
  category: z.string(),
  tags: z.array(z.string()).optional(),
})

export type CreateTicketBodySchema = z.infer<typeof createTicketBodySchema>

export const editTicketBodySchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['todo', 'inProgress', 'inReview', 'done']).optional(),
  priorityId: z.string().optional(),
  assignee: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export type EditTicketBodySchema = z.infer<typeof editTicketBodySchema>

export const addMessageBodySchema = z.object({
  author: z.string(),
  content: z.string(),
  type: z.enum(['comment', 'status_update', 'assignment']).optional(),
  mentions: z.array(z.string()).optional(),
})

export type AddMessageBodySchema = z.infer<typeof addMessageBodySchema>

export const ticketQuerySchema = z.object({
  search: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  category: z.string().optional(),
  assignee: z.string().optional(),
})

export type TicketQuerySchema = z.infer<typeof ticketQuerySchema>
