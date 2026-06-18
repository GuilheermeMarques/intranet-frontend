import { useQuery } from '@tanstack/react-query'
import { clientsApi } from '../api/clientsApi'

export function useClientByCodeQuery(code: string) {
  return useQuery({
    queryKey: ['client', code],
    queryFn: () => clientsApi.getByCode(code),
    enabled: !!code,
  })
}
