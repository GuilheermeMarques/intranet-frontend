import { BudgetItem as PrismaBudgetItem, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { BudgetItem } from '@/domain/sales/enterprise/entities/budget-item'

export class PrismaBudgetItemMapper {
  static toDomain(raw: PrismaBudgetItem): BudgetItem {
    return BudgetItem.create(
      {
        productId: raw.productId,
        productCode: raw.productCode,
        productName: raw.productName,
        quantity: raw.quantity,
        unitPrice: raw.unitPrice,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrismaCreate(
    item: BudgetItem,
    budgetId: string,
  ): Prisma.BudgetItemUncheckedCreateInput {
    return {
      id: item.id.toString(),
      budgetId,
      productId: item.productId ?? null,
      productCode: item.productCode ?? null,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }
  }
}
