import {
  Prisma,
  TicketAttachment as PrismaTicketAttachment,
} from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  Attachment,
  AttachmentType,
} from '@/domain/support/enterprise/entities/attachment'

export class PrismaAttachmentMapper {
  static toDomain(raw: PrismaTicketAttachment): Attachment {
    return Attachment.create(
      {
        ticketId: new UniqueEntityID(raw.ticketId),
        messageId: raw.messageId ? new UniqueEntityID(raw.messageId) : null,
        name: raw.name,
        url: raw.url,
        type: raw.type as AttachmentType,
        size: raw.size,
        uploadedBy: raw.uploadedBy,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(
    attachment: Attachment,
  ): Prisma.TicketAttachmentUncheckedCreateInput {
    return {
      id: attachment.id.toString(),
      ticketId: attachment.ticketId.toString(),
      messageId: attachment.messageId?.toString() ?? null,
      name: attachment.name,
      url: attachment.url,
      type: attachment.type,
      size: attachment.size,
      uploadedBy: attachment.uploadedBy,
      createdAt: attachment.createdAt,
    }
  }
}
