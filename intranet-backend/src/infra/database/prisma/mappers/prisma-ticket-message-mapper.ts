import { TicketMessage as PrismaTicketMessage, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Message, MessageType } from '@/domain/support/enterprise/entities/message'

export class PrismaTicketMessageMapper {
  static toDomain(raw: PrismaTicketMessage): Message {
    return Message.create(
      {
        ticketId: new UniqueEntityID(raw.ticketId),
        author: raw.author,
        content: raw.content,
        type: raw.type as MessageType,
        mentions: raw.mentions,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrismaCreate(
    message: Message,
  ): Prisma.TicketMessageUncheckedCreateInput {
    return {
      id: message.id.toString(),
      ticketId: message.ticketId.toString(),
      author: message.author,
      content: message.content,
      type: message.type,
      mentions: message.mentions,
      createdAt: message.createdAt,
    }
  }
}
