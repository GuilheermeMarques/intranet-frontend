import { Budget as PrismaBudget, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Budget, BudgetStatus } from '@/domain/sales/enterprise/entities/budget'
import { BudgetItem } from '@/domain/sales/enterprise/entities/budget-item'

export class PrismaBudgetMapper {
  static toDomain(raw: PrismaBudget, items: BudgetItem[]): Budget {
    return Budget.create(
      {
        number: raw.number,
        clientId: raw.clientId,
        clientName: raw.clientName,
        responsibleId: raw.responsibleId,
        responsibleName: raw.responsibleName,
        validityDate: raw.validityDate,
        status: raw.status as BudgetStatus,
        items,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrismaBudget(budget: Budget): Prisma.BudgetUncheckedCreateInput {
    return {
      id: budget.id.toString(),
      number: budget.number,
      clientId: budget.clientId,
      clientName: budget.clientName,
      responsibleId: budget.responsibleId,
      responsibleName: budget.responsibleName,
      validityDate: budget.validityDate ?? null,
      status: budget.status,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt ?? null,
    }
  }
}
