import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api/ticketsApi';

export function useTicketsQuery() {
  return useQuery({ queryKey: ['tickets'], queryFn: () => ticketsApi.list() });
}
