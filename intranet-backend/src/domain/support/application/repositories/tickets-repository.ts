import { Ticket } from '../../enterprise/entities/ticket'

export interface TicketFilters {
  search?: string
  priority?: string
  status?: string
  category?: string
  assignee?: string
}

export abstract class TicketsRepository {
  abstract findMany(filters: TicketFilters): Promise<Ticket[]>
  abstract findById(id: string): Promise<Ticket | null>
  abstract findDistinctCategories(): Promise<string[]>
  abstract findDistinctAssignees(): Promise<string[]>
  abstract create(ticket: Ticket): Promise<void>
  abstract save(ticket: Ticket): Promise<void>
  abstract delete(ticket: Ticket): Promise<void>
}
