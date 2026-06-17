import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { ClientFilters, ClientsRepository } from '@/domain/sales/application/repositories/clients-repository'
import { Client } from '@/domain/sales/enterprise/entities/client'
import { PrismaClientMapper } from '../mappers/prisma-client-mapper'

@Injectable()
export class PrismaClientsRepository implements ClientsRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(filters: ClientFilters): Promise<Client[]> {
    const where: Prisma.ClientWhereInput = {}
    if (filters.code?.trim()) where.code = { contains: filters.code, mode: 'insensitive' }
    if (filters.name?.trim()) where.name = { contains: filters.name, mode: 'insensitive' }
    if (filters.city?.trim()) where.city = filters.city
    if (filters.startDate || filters.endDate) {
      where.lastPurchaseAt = {}
      if (filters.startDate) where.lastPurchaseAt.gte = filters.startDate
      if (filters.endDate) where.lastPurchaseAt.lte = filters.endDate
    }

    const rows = await this.prisma.client.findMany({ where, orderBy: { name: 'asc' } })
    return rows.map(PrismaClientMapper.toDomain)
  }

  async findById(id: string): Promise<Client | null> {
    const row = await this.prisma.client.findUnique({ where: { id } })
    return row ? PrismaClientMapper.toDomain(row) : null
  }

  async findByCode(code: string): Promise<Client | null> {
    const row = await this.prisma.client.findUnique({ where: { code } })
    return row ? PrismaClientMapper.toDomain(row) : null
  }

  async findDistinctCities(): Promise<string[]> {
    const rows = await this.prisma.client.findMany({
      distinct: ['city'],
      select: { city: true },
      orderBy: { city: 'asc' },
    })
    return rows.map((r) => r.city)
  }

  async count(): Promise<number> {
    return this.prisma.client.count()
  }

  async create(client: Client): Promise<void> {
    await this.prisma.client.create({ data: PrismaClientMapper.toPrisma(client) })
  }

  async save(client: Client): Promise<void> {
    const data = PrismaClientMapper.toPrisma(client)
    await this.prisma.client.update({ where: { id: data.id as string }, data })
  }

  async delete(client: Client): Promise<void> {
    await this.prisma.client.delete({ where: { id: client.id.toString() } })
  }
}
