import { httpClient, ApiError } from '@/services/httpClient'
import type { Order, OrderFilters } from '../types'

export interface OrderItemInput { productId: string; quantity: number; unitPrice?: number }
export interface OrderInput {
  clientId: string
  items: OrderItemInput[]
  shippingCost?: number
  notes?: string
}

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
  async create(data: OrderInput): Promise<Order> {
    const { order } = await httpClient.post<{ order: Order }>('/orders', data)
    return order
  },
  async updateStatus(id: string, status: string): Promise<Order> {
    const { order } = await httpClient.patch<{ order: Order }>(`/orders/${id}/status`, { status })
    return order
  },
}
