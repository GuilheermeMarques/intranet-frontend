import ordersMock from '@/mocks/orders.json';
import type { Order, OrderFilters } from '../types';

const orders = ordersMock.orders as Order[];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const ordersApi = {
  async list(filters?: Partial<OrderFilters>): Promise<Order[]> {
    await delay(0);
    let result = [...orders];

    if (filters?.orderCode?.trim()) {
      const term = filters.orderCode.toLowerCase();
      result = result.filter((o) => o.id.toLowerCase().includes(term));
    }
    if (filters?.clientName?.trim()) {
      const term = filters.clientName.toLowerCase();
      result = result.filter((o) => o.clientName.toLowerCase().includes(term));
    }
    if (filters?.status?.trim()) {
      result = result.filter((o) => o.status === filters.status);
    }

    return result;
  },

  async getById(id: string): Promise<Order | null> {
    await delay(0);
    return orders.find((o) => o.id === id) ?? null;
  },
};
