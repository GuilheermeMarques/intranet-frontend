import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import type { ProductFilters } from '../types';

export function useProductsQuery(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters.code, filters.name, filters.supplier],
    queryFn: () => productsApi.list(filters),
  });
}
