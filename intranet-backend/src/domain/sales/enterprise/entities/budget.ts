import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { BudgetItem } from './budget-item'

export type BudgetStatus = 'pending' | 'approved' | 'rejected' | 'expired'

export interface BudgetProps {
  number: string
  clientId: string
  clientName: string
  responsibleId: string
  responsibleName: string
  status: BudgetStatus
  validityDate?: Date | null
  items: BudgetItem[]
  createdAt: Date
  updatedAt?: Date | null
}

export class Budget extends Entity<BudgetProps> {
  get number() {
    return this.props.number
  }
  get clientId() {
    return this.props.clientId
  }
  get clientName() {
    return this.props.clientName
  }
  get responsibleId() {
    return this.props.responsibleId
  }
  get responsibleName() {
    return this.props.responsibleName
  }
  get status() {
    return this.props.status
  }
  get validityDate() {
    return this.props.validityDate
  }
  get items() {
    return this.props.items
  }
  get createdAt() {
    return this.props.createdAt
  }
  get updatedAt() {
    return this.props.updatedAt
  }

  get total() {
    return this.props.items.reduce((sum, item) => sum + item.total, 0)
  }

  set items(items: BudgetItem[]) {
    this.props.items = items
    this.touch()
  }
  set status(value: BudgetStatus) {
    this.props.status = value
    this.touch()
  }
  set validityDate(value: Date | null | undefined) {
    this.props.validityDate = value
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<BudgetProps, 'status' | 'items' | 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new Budget(
      {
        ...props,
        status: props.status ?? 'pending',
        items: props.items ?? [],
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
