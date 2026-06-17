import { Order } from '../../enterprise/entities/order'

export interface OrderFilters {
  orderCode?: string
  clientName?: string
  status?: string
}

export abstract class OrdersRepository {
  abstract findMany(filters: OrderFilters): Promise<Order[]>
  abstract findById(id: string): Promise<Order | null>
  abstract count(): Promise<number>
  abstract create(order: Order): Promise<void>
  abstract save(order: Order): Promise<void>
}
