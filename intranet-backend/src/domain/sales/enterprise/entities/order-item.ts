import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface OrderItemProps {
  productId?: string | null
  productCode?: string | null
  productName: string
  quantity: number
  unitPrice: number
}

export class OrderItem extends Entity<OrderItemProps> {
  get productId() {
    return this.props.productId
  }
  get productCode() {
    return this.props.productCode
  }
  get productName() {
    return this.props.productName
  }
  get quantity() {
    return this.props.quantity
  }
  get unitPrice() {
    return this.props.unitPrice
  }
  get total() {
    return this.props.quantity * this.props.unitPrice
  }

  static create(props: OrderItemProps, id?: UniqueEntityID) {
    return new OrderItem(props, id)
  }
}
