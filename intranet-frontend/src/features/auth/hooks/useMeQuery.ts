import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/services/httpClient'
import type { CurrentUser } from '../types'

export function useMeQuery() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => httpClient.get<{ user: CurrentUser }>('/me').then((r) => r.user),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
