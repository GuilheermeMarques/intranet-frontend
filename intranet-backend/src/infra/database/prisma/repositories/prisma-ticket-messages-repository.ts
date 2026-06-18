import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { TicketMessagesRepository } from '@/domain/support/application/repositories/ticket-messages-repository'
import { Message } from '@/domain/support/enterprise/entities/message'
import { PrismaTicketMessageMapper } from '../mappers/prisma-ticket-message-mapper'

@Injectable()
export class PrismaTicketMessagesRepository
  implements TicketMessagesRepository
{
  constructor(private prisma: PrismaService) {}

  async create(message: Message): Promise<void> {
    await this.prisma.ticketMessage.create({
      data: PrismaTicketMessageMapper.toPrismaCreate(message),
    })
  }
}
