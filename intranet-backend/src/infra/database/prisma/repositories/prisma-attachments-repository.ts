import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { AttachmentsRepository } from '@/domain/support/application/repositories/attachments-repository'
import { Attachment } from '@/domain/support/enterprise/entities/attachment'
import { PrismaAttachmentMapper } from '../mappers/prisma-attachment-mapper'

@Injectable()
export class PrismaAttachmentsRepository implements AttachmentsRepository {
  constructor(private prisma: PrismaService) {}

  async create(attachment: Attachment): Promise<void> {
    await this.prisma.ticketAttachment.create({
      data: PrismaAttachmentMapper.toPrisma(attachment),
    })
  }
}
