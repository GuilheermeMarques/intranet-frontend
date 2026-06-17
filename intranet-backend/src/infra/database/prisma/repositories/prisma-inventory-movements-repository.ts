import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import {
  InventoryMovementFilters,
  InventoryMovementsRepository,
} from '@/domain/sales/application/repositories/inventory-movements-repository'
import { InventoryMovement } from '@/domain/sales/enterprise/entities/inventory-movement'
import { PrismaInventoryMovementMapper } from '../mappers/prisma-inventory-movement-mapper'

@Injectable()
export class PrismaInventoryMovementsRepository
  implements InventoryMovementsRepository
{
  constructor(private prisma: PrismaService) {}

  async findMany(
    filters: InventoryMovementFilters,
  ): Promise<InventoryMovement[]> {
    const where: Prisma.InventoryMovementWhereInput = {}
    if (filters.productCode?.trim())
      where.productCode = { contains: filters.productCode, mode: 'insensitive' }
    if (filters.description?.trim())
      where.description = { contains: filters.description, mode: 'insensitive' }
    if (filters.type?.trim()) where.type = filters.type
    if (filters.startDate || filters.endDate) {
      where.occurredAt = {}
      if (filters.startDate) where.occurredAt.gte = filters.startDate
      if (filters.endDate) where.occurredAt.lte = filters.endDate
    }

    const rows = await this.prisma.inventoryMovement.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
    })
    return rows.map(PrismaInventoryMovementMapper.toDomain)
  }

  async create(movement: InventoryMovement): Promise<void> {
    await this.prisma.inventoryMovement.create({
      data: PrismaInventoryMovementMapper.toPrisma(movement),
    })
  }
}
