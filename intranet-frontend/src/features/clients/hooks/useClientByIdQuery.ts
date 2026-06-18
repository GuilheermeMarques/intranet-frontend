import { useQuery } from '@tanstack/react-query'
import { clientsApi } from '../api/clientsApi'

export function useClientByIdQuery(id: string) {
  return useQuery({
    queryKey: ['client-by-id', id],
    queryFn: () => clientsApi.getById(id),
    enabled: !!id,
  })
}
