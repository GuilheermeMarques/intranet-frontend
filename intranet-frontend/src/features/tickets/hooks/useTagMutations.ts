import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tagsApi, TagInput } from '../api/tagsApi'

export function useTagMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['ticket-tags'] })

  const create = useMutation({ mutationFn: (data: TagInput) => tagsApi.create(data), onSuccess: invalidate })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TagInput> }) => tagsApi.update(id, data),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: (id: string) => tagsApi.remove(id), onSuccess: invalidate })

  return { create, update, remove }
}
