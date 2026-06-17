import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export type InventoryMovementType = 'inbound' | 'outbound'

export interface InventoryMovementProps {
  productCode: string
  description: string
  quantity: number
  type: InventoryMovementType
  occurredAt: Date
  reason?: string | null
  handledBy?: string | null
  notes?: string | null
}

export class InventoryMovement extends Entity<InventoryMovementProps> {
  get productCode() {
    return this.props.productCode
  }
  get description() {
    return this.props.description
  }
  get quantity() {
    return this.props.quantity
  }
  get type() {
    return this.props.type
  }
  get occurredAt() {
    return this.props.occurredAt
  }
  get reason() {
    return this.props.reason
  }
  get handledBy() {
    return this.props.handledBy
  }
  get notes() {
    return this.props.notes
  }

  static create(
    props: Optional<
      InventoryMovementProps,
      'occurredAt' | 'reason' | 'handledBy' | 'notes'
    >,
    id?: UniqueEntityID,
  ) {
    return new InventoryMovement(
      {
        ...props,
        occurredAt: props.occurredAt ?? new Date(),
        reason: props.reason ?? null,
        handledBy: props.handledBy ?? null,
        notes: props.notes ?? null,
      },
      id,
    )
  }
}
