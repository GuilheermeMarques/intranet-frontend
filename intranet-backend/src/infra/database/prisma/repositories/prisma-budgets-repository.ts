import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import {
  BudgetFilters,
  BudgetsRepository,
} from '@/domain/sales/application/repositories/budgets-repository'
import { Budget } from '@/domain/sales/enterprise/entities/budget'
import { PrismaBudgetMapper } from '../mappers/prisma-budget-mapper'
import { PrismaBudgetItemMapper } from '../mappers/prisma-budget-item-mapper'

@Injectable()
export class PrismaBudgetsRepository implements BudgetsRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(filters: BudgetFilters): Promise<Budget[]> {
    const where: Prisma.BudgetWhereInput = {}
    if (filters.budgetNumber?.trim())
      where.number = { contains: filters.budgetNumber, mode: 'insensitive' }
    if (filters.clientId?.trim()) where.clientId = filters.clientId
    if (filters.responsibleId?.trim())
      where.responsibleId = filters.responsibleId
    if (filters.status?.trim()) where.status = filters.status
    if (filters.startDate || filters.endDate) {
      where.createdAt = {}
      if (filters.startDate) where.createdAt.gte = filters.startDate
      if (filters.endDate) where.createdAt.lte = filters.endDate
    }

    const rows = await this.prisma.budget.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })

    return rows.map((row) =>
      PrismaBudgetMapper.toDomain(
        row,
        row.items.map(PrismaBudgetItemMapper.toDomain),
      ),
    )
  }

  async findById(id: string): Promise<Budget | null> {
    const row = await this.prisma.budget.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!row) return null
    return PrismaBudgetMapper.toDomain(
      row,
      row.items.map(PrismaBudgetItemMapper.toDomain),
    )
  }

  async count(): Promise<number> {
    return this.prisma.budget.count()
  }

  async create(budget: Budget): Promise<void> {
    const data = PrismaBudgetMapper.toPrismaBudget(budget)
    const budgetId = budget.id.toString()

    await this.prisma.budget.create({
      data: {
        ...data,
        items: {
          create: budget.items.map((item) => {
            const { budgetId: _budgetId, ...itemColumns } =
              PrismaBudgetItemMapper.toPrismaCreate(item, budgetId)
            return itemColumns
          }),
        },
      },
    })
  }

  async save(budget: Budget): Promise<void> {
    const data = PrismaBudgetMapper.toPrismaBudget(budget)
    const budgetId = budget.id.toString()

    await this.prisma.$transaction([
      this.prisma.budget.update({ where: { id: budgetId }, data }),
      this.prisma.budgetItem.deleteMany({ where: { budgetId } }),
      this.prisma.budgetItem.createMany({
        data: budget.items.map((item) =>
          PrismaBudgetItemMapper.toPrismaCreate(item, budgetId),
        ),
      }),
    ])
  }

  async delete(budget: Budget): Promise<void> {
    await this.prisma.budget.delete({ where: { id: budget.id.toString() } })
  }
}
