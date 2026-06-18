import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PrioritiesRepository } from '@/domain/support/application/repositories/priorities-repository'
import { Priority } from '@/domain/support/enterprise/entities/priority'
import { PrismaPriorityMapper } from '../mappers/prisma-priority-mapper'

@Injectable()
export class PrismaPrioritiesRepository implements PrioritiesRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(): Promise<Priority[]> {
    const rows = await this.prisma.ticketPriority.findMany({
      orderBy: { level: 'asc' },
    })
    return rows.map(PrismaPriorityMapper.toDomain)
  }

  async findById(id: string): Promise<Priority | null> {
    const row = await this.prisma.ticketPriority.findUnique({ where: { id } })
    return row ? PrismaPriorityMapper.toDomain(row) : null
  }

  async create(priority: Priority): Promise<void> {
    await this.prisma.ticketPriority.create({
      data: PrismaPriorityMapper.toPrisma(priority),
    })
  }

  async save(priority: Priority): Promise<void> {
    const data = PrismaPriorityMapper.toPrisma(priority)
    await this.prisma.ticketPriority.update({
      where: { id: data.id as string },
      data,
    })
  }

  async delete(priority: Priority): Promise<void> {
    await this.prisma.ticketPriority.delete({
      where: { id: priority.id.toString() },
    })
  }
}
