import {
  TicketFilters,
  TicketsRepository,
} from '@/domain/support/application/repositories/tickets-repository'
import { Ticket } from '@/domain/support/enterprise/entities/ticket'

export class InMemoryTicketsRepository implements TicketsRepository {
  public items: Ticket[] = []

  async findMany(filters: TicketFilters): Promise<Ticket[]> {
    return this.items.filter((ticket) => {
      if (filters.search?.trim()) {
        const search = filters.search.toLowerCase()
        const matches =
          ticket.title.toLowerCase().includes(search) ||
          ticket.description.toLowerCase().includes(search)
        if (!matches) return false
      }
      if (filters.priority?.trim() && ticket.priorityId !== filters.priority)
        return false
      if (filters.status?.trim() && ticket.status !== filters.status)
        return false
      if (filters.category?.trim() && ticket.category !== filters.category)
        return false
      if (filters.assignee?.trim() && ticket.assignee !== filters.assignee)
        return false
      return true
    })
  }

  async findById(id: string) {
    return this.items.find((t) => t.id.toString() === id) ?? null
  }

  async findDistinctCategories(): Promise<string[]> {
    return [...new Set(this.items.map((t) => t.category))].sort()
  }

  async findDistinctAssignees(): Promise<string[]> {
    return [...new Set(this.items.map((t) => t.assignee))].sort()
  }

  async create(ticket: Ticket) {
    this.items.push(ticket)
  }

  async save(ticket: Ticket) {
    const index = this.items.findIndex((t) => t.id.equals(ticket.id))
    if (index >= 0) this.items[index] = ticket
  }

  async delete(ticket: Ticket) {
    const index = this.items.findIndex((t) => t.id.equals(ticket.id))
    if (index >= 0) this.items.splice(index, 1)
  }
}
