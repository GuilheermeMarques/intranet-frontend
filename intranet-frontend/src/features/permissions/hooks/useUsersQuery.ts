import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../api/usersApi'

export function useUsersQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
    enabled: options?.enabled ?? true,
  })
}
