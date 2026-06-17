import { InventoryMovement } from '@/domain/sales/enterprise/entities/inventory-movement'

export class InventoryMovementPresenter {
  static toHTTP(movement: InventoryMovement) {
    return {
      id: movement.id.toString(),
      productCode: movement.productCode,
      description: movement.description,
      quantity: movement.quantity,
      type: movement.type,
      occurredAt: movement.occurredAt.toISOString(),
      reason: movement.reason ?? null,
      handledBy: movement.handledBy ?? null,
      notes: movement.notes ?? null,
    }
  }
}
