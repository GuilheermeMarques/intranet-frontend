import { Ticket } from '@/domain/support/enterprise/entities/ticket'
import { MessagePresenter } from './message-presenter'

export class TicketPresenter {
  static toHTTP(ticket: Ticket) {
    return {
      id: ticket.id.toString(),
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priorityId,
      assignee: ticket.assignee,
      reporter: ticket.reporter,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt ? ticket.updatedAt.toISOString() : null,
      category: ticket.category,
      tags: ticket.tags,
      messages: ticket.messages.map(MessagePresenter.toHTTP),
    }
  }
}
