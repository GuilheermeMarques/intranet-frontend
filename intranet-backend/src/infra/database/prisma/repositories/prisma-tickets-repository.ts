import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import {
  TicketFilters,
  TicketsRepository,
} from '@/domain/support/application/repositories/tickets-repository'
import { Ticket } from '@/domain/support/enterprise/entities/ticket'
import { PrismaTicketMapper } from '../mappers/prisma-ticket-mapper'
import { PrismaTicketMessageMapper } from '../mappers/prisma-ticket-message-mapper'
import { PrismaAttachmentMapper } from '../mappers/prisma-attachment-mapper'

@Injectable()
export class PrismaTicketsRepository implements TicketsRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(filters: TicketFilters): Promise<Ticket[]> {
    const where: Prisma.TicketWhereInput = {}
    if (filters.search?.trim())
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    if (filters.priority?.trim()) where.priorityId = filters.priority
    if (filters.status?.trim()) where.status = filters.status
    if (filters.category?.trim()) where.category = filters.category
    if (filters.assignee?.trim()) where.assignee = filters.assignee

    const rows = await this.prisma.ticket.findMany({
      where,
      include: {
        messages: true,
        attachments: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return rows.map((row) =>
      PrismaTicketMapper.toDomain(
        row,
        row.messages.map(PrismaTicketMessageMapper.toDomain),
        row.attachments.map(PrismaAttachmentMapper.toDomain),
      ),
    )
  }

  async findById(id: string): Promise<Ticket | null> {
    const row = await this.prisma.ticket.findUnique({
      where: { id },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        attachments: { orderBy: { createdAt: 'asc' } },
      },
    })
    if (!row) return null
    return PrismaTicketMapper.toDomain(
      row,
      row.messages.map(PrismaTicketMessageMapper.toDomain),
      row.attachments.map(PrismaAttachmentMapper.toDomain),
    )
  }

  async findDistinctCategories(): Promise<string[]> {
    const rows = await this.prisma.ticket.findMany({
      distinct: ['category'],
      select: { category: true },
      orderBy: { category: 'asc' },
    })
    return rows.map((row) => row.category)
  }

  async findDistinctAssignees(): Promise<string[]> {
    const rows = await this.prisma.ticket.findMany({
      distinct: ['assignee'],
      select: { assignee: true },
      orderBy: { assignee: 'asc' },
    })
    return rows.map((row) => row.assignee)
  }

  async create(ticket: Ticket): Promise<void> {
    await this.prisma.ticket.create({
      data: PrismaTicketMapper.toPrismaTicket(ticket),
    })
  }

  async save(ticket: Ticket): Promise<void> {
    const data = PrismaTicketMapper.toPrismaTicket(ticket)
    await this.prisma.ticket.update({
      where: { id: ticket.id.toString() },
      data,
    })
  }

  async delete(ticket: Ticket): Promise<void> {
    await this.prisma.ticket.delete({
      where: { id: ticket.id.toString() },
    })
  }
}
