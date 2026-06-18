import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsApi, ClientInput } from '../api/clientsApi'

export function useClientMutations() {
  const queryClient = useQueryClient()
  const create = useMutation({
    mutationFn: (data: ClientInput) => clientsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })
  return { create }
}
