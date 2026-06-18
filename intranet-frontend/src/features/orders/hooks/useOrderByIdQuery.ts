import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../api/ordersApi'

export function useOrderByIdQuery(id: string) {
  return useQuery({ queryKey: ['order', id], queryFn: () => ordersApi.getById(id), enabled: !!id })
}
