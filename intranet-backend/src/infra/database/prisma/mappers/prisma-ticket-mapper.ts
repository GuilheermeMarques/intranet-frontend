import { Ticket as PrismaTicket, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Ticket, TicketStatus } from '@/domain/support/enterprise/entities/ticket'
import { Message } from '@/domain/support/enterprise/entities/message'
import { Attachment } from '@/domain/support/enterprise/entities/attachment'

export class PrismaTicketMapper {
  static toDomain(
    raw: PrismaTicket,
    messages: Message[],
    attachments: Attachment[] = [],
  ): Ticket {
    return Ticket.create(
      {
        title: raw.title,
        description: raw.description,
        status: raw.status as TicketStatus,
        priorityId: raw.priorityId,
        assignee: raw.assignee,
        reporter: raw.reporter,
        category: raw.category,
        tags: raw.tags,
        messages,
        attachments,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrismaTicket(ticket: Ticket): Prisma.TicketUncheckedCreateInput {
    return {
      id: ticket.id.toString(),
      title: ticket.title,
      description: ticket.description,
      status: ticket.status,
      priorityId: ticket.priorityId,
      assignee: ticket.assignee,
      reporter: ticket.reporter,
      category: ticket.category,
      tags: ticket.tags,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt ?? null,
    }
  }
}
