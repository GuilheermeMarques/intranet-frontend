import { httpClient, ApiError } from '@/services/httpClient'
import type { Order, OrderFilters } from '../types'

export const ordersApi = {
  async list(filters?: Partial<OrderFilters>): Promise<Order[]> {
    const { orders } = await httpClient.get<{ orders: Order[] }>('/orders', filters as Record<string, unknown> | undefined)
    return orders
  },
  async getById(id: string): Promise<Order | null> {
    try {
      const { order } = await httpClient.get<{ order: Order }>(`/orders/${id}`)
      return order
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },
}
