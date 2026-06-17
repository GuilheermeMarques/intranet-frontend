import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import {
  RepresentativeFilters,
  RepresentativesRepository,
} from '@/domain/sales/application/repositories/representatives-repository'
import { Representative } from '@/domain/sales/enterprise/entities/representative'
import { PrismaRepresentativeMapper } from '../mappers/prisma-representative-mapper'

@Injectable()
export class PrismaRepresentativesRepository
  implements RepresentativesRepository
{
  constructor(private prisma: PrismaService) {}

  async findMany(filters: RepresentativeFilters): Promise<Representative[]> {
    const where: Prisma.RepresentativeWhereInput = {}
    if (filters.name?.trim())
      where.name = { contains: filters.name, mode: 'insensitive' }
    if (filters.region?.trim()) where.region = filters.region
    if (filters.status?.trim()) where.status = filters.status

    const rows = await this.prisma.representative.findMany({
      where,
      orderBy: { name: 'asc' },
    })
    return rows.map(PrismaRepresentativeMapper.toDomain)
  }

  async findById(id: string): Promise<Representative | null> {
    const row = await this.prisma.representative.findUnique({ where: { id } })
    if (!row) return null
    return PrismaRepresentativeMapper.toDomain(row)
  }

  async findDistinctRegions(): Promise<string[]> {
    const rows = await this.prisma.representative.findMany({
      distinct: ['region'],
      select: { region: true },
      orderBy: { region: 'asc' },
    })
    return rows.map((r) => r.region)
  }
}
