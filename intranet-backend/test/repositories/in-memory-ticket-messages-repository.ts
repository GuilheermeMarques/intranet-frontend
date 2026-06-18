import { TicketMessagesRepository } from '@/domain/support/application/repositories/ticket-messages-repository'
import { Message } from '@/domain/support/enterprise/entities/message'
import { InMemoryTicketsRepository } from './in-memory-tickets-repository'

export class InMemoryTicketMessagesRepository
  implements TicketMessagesRepository
{
  constructor(private ticketsRepository: InMemoryTicketsRepository) {}

  async create(message: Message): Promise<void> {
    const ticket = this.ticketsRepository.items.find(
      (t) => t.id.toString() === message.ticketId.toString(),
    )
    if (ticket) ticket.messages.push(message)
  }
}
