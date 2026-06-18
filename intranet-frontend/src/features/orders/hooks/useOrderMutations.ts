import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, OrderInput } from '../api/ordersApi'

export function useOrderMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['orders'] })
  const create = useMutation({ mutationFn: (data: OrderInput) => ordersApi.create(data), onSuccess: invalidate })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: (order) => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['order', order.id] })
    },
  })
  return { create, updateStatus }
}
