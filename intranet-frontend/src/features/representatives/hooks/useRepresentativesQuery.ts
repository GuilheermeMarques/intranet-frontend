import { useQuery } from '@tanstack/react-query';
import { representativesApi } from '../api/representativesApi';
import type { RepresentativeFilters } from '../types';

export function useRepresentativesQuery(filters: RepresentativeFilters) {
  return useQuery({
    queryKey: ['representatives', filters.name, filters.region, filters.status],
    queryFn: () => representativesApi.list(filters),
  });
}
