import { useMutation, useQueryClient } from '@tanstack/react-query'
import { prioritiesApi, PriorityInput } from '../api/prioritiesApi'

export function usePriorityMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['ticket-priorities'] })

  const create = useMutation({ mutationFn: (data: PriorityInput) => prioritiesApi.create(data), onSuccess: invalidate })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PriorityInput> }) => prioritiesApi.update(id, data),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: (id: string) => prioritiesApi.remove(id), onSuccess: invalidate })

  return { create, update, remove }
}
