import {
  OrderFilters,
  OrdersRepository,
} from '@/domain/sales/application/repositories/orders-repository'
import { Order } from '@/domain/sales/enterprise/entities/order'

export class InMemoryOrdersRepository implements OrdersRepository {
  public items: Order[] = []

  async findMany(filters: OrderFilters): Promise<Order[]> {
    return this.items.filter((order) => {
      if (
        filters.orderCode?.trim() &&
        !order.orderCode.toLowerCase().includes(filters.orderCode.toLowerCase())
      )
        return false
      if (
        filters.clientName?.trim() &&
        !order.clientName
          .toLowerCase()
          .includes(filters.clientName.toLowerCase())
      )
        return false
      if (filters.status?.trim() && order.status !== filters.status) return false
      return true
    })
  }

  async findById(id: string) {
    return this.items.find((o) => o.id.toString() === id) ?? null
  }

  async count() {
    return this.items.length
  }

  async create(order: Order) {
    this.items.push(order)
  }

  async save(order: Order) {
    const index = this.items.findIndex((o) => o.id.equals(order.id))
    if (index >= 0) this.items[index] = order
  }
}
