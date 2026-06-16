import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '../api/clientsApi';
import type { ClientFilters } from '../types';

export function useClientsQuery(filters: ClientFilters) {
  return useQuery({
    queryKey: ['clients', filters.code, filters.name, filters.city],
    queryFn: () => clientsApi.list(filters),
  });
}
