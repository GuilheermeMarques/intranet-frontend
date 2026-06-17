import { InventoryMovement } from '../../enterprise/entities/inventory-movement'

export interface InventoryMovementFilters {
  productCode?: string
  description?: string
  type?: string
  startDate?: Date | null
  endDate?: Date | null
}

export abstract class InventoryMovementsRepository {
  abstract findMany(
    filters: InventoryMovementFilters,
  ): Promise<InventoryMovement[]>
  abstract create(movement: InventoryMovement): Promise<void>
}
