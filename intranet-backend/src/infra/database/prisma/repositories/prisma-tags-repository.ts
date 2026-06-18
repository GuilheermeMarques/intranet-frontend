import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { TagsRepository } from '@/domain/support/application/repositories/tags-repository'
import { Tag } from '@/domain/support/enterprise/entities/tag'
import { PrismaTagMapper } from '../mappers/prisma-tag-mapper'

@Injectable()
export class PrismaTagsRepository implements TagsRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(): Promise<Tag[]> {
    const rows = await this.prisma.ticketTag.findMany({
      orderBy: { name: 'asc' },
    })
    return rows.map(PrismaTagMapper.toDomain)
  }

  async findById(id: string): Promise<Tag | null> {
    const row = await this.prisma.ticketTag.findUnique({ where: { id } })
    return row ? PrismaTagMapper.toDomain(row) : null
  }

  async create(tag: Tag): Promise<void> {
    await this.prisma.ticketTag.create({ data: PrismaTagMapper.toPrisma(tag) })
  }

  async save(tag: Tag): Promise<void> {
    const data = PrismaTagMapper.toPrisma(tag)
    await this.prisma.ticketTag.update({ where: { id: data.id as string }, data })
  }

  async delete(tag: Tag): Promise<void> {
    await this.prisma.ticketTag.delete({ where: { id: tag.id.toString() } })
  }
}
