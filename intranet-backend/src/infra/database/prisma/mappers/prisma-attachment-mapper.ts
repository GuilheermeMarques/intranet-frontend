import { Prisma } from '@prisma/client'
import { Attachment } from '@/domain/support/enterprise/entities/attachment'

export class PrismaAttachmentMapper {
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
