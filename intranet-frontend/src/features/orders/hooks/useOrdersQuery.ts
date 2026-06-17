import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/ordersApi';
import type { OrderFilters } from '../types';

export function useOrdersQuery(filters: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters.orderCode, filters.clientName, filters.status],
    queryFn: () => ordersApi.list(filters),
  });
}
