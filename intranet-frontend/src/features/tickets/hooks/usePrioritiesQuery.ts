import { useQuery } from '@tanstack/react-query';
import { prioritiesApi } from '../api/prioritiesApi';

export function usePrioritiesQuery() {
  return useQuery({ queryKey: ['ticket-priorities'], queryFn: () => prioritiesApi.list() });
}
