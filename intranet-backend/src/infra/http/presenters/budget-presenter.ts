import { Budget } from '@/domain/sales/enterprise/entities/budget'

export class BudgetPresenter {
  static toHTTP(budget: Budget) {
    return {
      id: budget.id.toString(),
      number: budget.number,
      clientId: budget.clientId,
      clientName: budget.clientName,
      responsibleId: budget.responsibleId,
      responsibleName: budget.responsibleName,
      createdAt: budget.createdAt.toISOString(),
      validityDate: budget.validityDate
        ? budget.validityDate.toISOString()
        : null,
      status: budget.status,
      total: budget.total,
      items: budget.items.map((item) => ({
        id: item.id.toString(),
        productId: item.productId ?? null,
        productCode: item.productCode ?? null,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
    }
  }
}
