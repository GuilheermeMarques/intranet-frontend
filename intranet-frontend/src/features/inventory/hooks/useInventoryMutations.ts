import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi, MovementInput } from '../api/inventoryApi'

export function useInventoryMutations() {
  const queryClient = useQueryClient()
  const create = useMutation({
    mutationFn: (data: MovementInput) => inventoryApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  })
  return { create }
}
