import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { OrderItem } from './order-item'

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'canceled'

export interface OrderProps {
  orderCode: string
  clientId?: string | null
  clientCode: string
  clientName: string
  clientEmail?: string | null
  clientPhone?: string | null
  items: OrderItem[]
  shippingCost: number
  status: OrderStatus
  notes?: string | null
  createdAt: Date
  updatedAt?: Date | null
}

export class Order extends Entity<OrderProps> {
  get orderCode() {
    return this.props.orderCode
  }
  get clientId() {
    return this.props.clientId
  }
  get clientCode() {
    return this.props.clientCode
  }
  get clientName() {
    return this.props.clientName
  }
  get clientEmail() {
    return this.props.clientEmail
  }
  get clientPhone() {
    return this.props.clientPhone
  }
  get items() {
    return this.props.items
  }
  get shippingCost() {
    return this.props.shippingCost
  }
  get status() {
    return this.props.status
  }
  get notes() {
    return this.props.notes
  }
  get createdAt() {
    return this.props.createdAt
  }
  get updatedAt() {
    return this.props.updatedAt
  }

  get subtotal() {
    return this.props.items.reduce((sum, item) => sum + item.total, 0)
  }
  get total() {
    return this.subtotal + this.props.shippingCost
  }

  set items(items: OrderItem[]) {
    this.props.items = items
    this.touch()
  }
  set shippingCost(value: number) {
    this.props.shippingCost = value
    this.touch()
  }
  set status(value: OrderStatus) {
    this.props.status = value
    this.touch()
  }
  set notes(value: string | null | undefined) {
    this.props.notes = value
    this.touch()
  }

  private touch() {
    this.props.updatedAt = new Date()
  }

  static create(
    props: Optional<
      OrderProps,
      'status' | 'shippingCost' | 'items' | 'createdAt'
    >,
    id?: UniqueEntityID,
  ) {
    return new Order(
      {
        ...props,
        status: props.status ?? 'pending',
        shippingCost: props.shippingCost ?? 0,
        items: props.items ?? [],
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
