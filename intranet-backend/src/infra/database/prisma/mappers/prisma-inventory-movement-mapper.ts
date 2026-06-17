import {
  InventoryMovement as PrismaInventoryMovementModel,
  Prisma,
} from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import {
  InventoryMovement,
  InventoryMovementType,
} from '@/domain/sales/enterprise/entities/inventory-movement'

export class PrismaInventoryMovementMapper {
  static toDomain(raw: PrismaInventoryMovementModel): InventoryMovement {
    return InventoryMovement.create(
      {
        productCode: raw.productCode,
        description: raw.description,
        quantity: raw.quantity,
        type: raw.type as InventoryMovementType,
        occurredAt: raw.occurredAt,
        reason: raw.reason,
        handledBy: raw.handledBy,
        notes: raw.notes,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(
    movement: InventoryMovement,
  ): Prisma.InventoryMovementUncheckedCreateInput {
    return {
      id: movement.id.toString(),
      productCode: movement.productCode,
      description: movement.description,
      quantity: movement.quantity,
      type: movement.type,
      occurredAt: movement.occurredAt,
      reason: movement.reason ?? null,
      handledBy: movement.handledBy ?? null,
      notes: movement.notes ?? null,
    }
  }
}
