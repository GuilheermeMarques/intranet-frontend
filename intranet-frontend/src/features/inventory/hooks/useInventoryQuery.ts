import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventoryApi';
import type { InventoryFilters } from '../types';

export function useInventoryQuery(filters: InventoryFilters) {
  return useQuery({
    queryKey: [
      'inventory',
      filters.productCode,
      filters.description,
      filters.type,
      filters.startDate?.getTime() ?? null,
      filters.endDate?.getTime() ?? null,
    ],
    queryFn: () => inventoryApi.list(filters),
  });
}
