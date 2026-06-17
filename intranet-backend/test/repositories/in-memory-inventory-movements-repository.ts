import {
  InventoryMovementFilters,
  InventoryMovementsRepository,
} from '@/domain/sales/application/repositories/inventory-movements-repository'
import { InventoryMovement } from '@/domain/sales/enterprise/entities/inventory-movement'

export class InMemoryInventoryMovementsRepository
  implements InventoryMovementsRepository
{
  public items: InventoryMovement[] = []

  async findMany(
    filters: InventoryMovementFilters,
  ): Promise<InventoryMovement[]> {
    return this.items
      .filter((movement) => {
        if (
          filters.productCode?.trim() &&
          !movement.productCode
            .toLowerCase()
            .includes(filters.productCode.toLowerCase())
        )
          return false
        if (
          filters.description?.trim() &&
          !movement.description
            .toLowerCase()
            .includes(filters.description.toLowerCase())
        )
          return false
        if (filters.type?.trim() && movement.type !== filters.type) return false
        if (filters.startDate && movement.occurredAt < filters.startDate)
          return false
        if (filters.endDate && movement.occurredAt > filters.endDate)
          return false
        return true
      })
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
  }

  async create(movement: InventoryMovement) {
    this.items.push(movement)
  }
}
