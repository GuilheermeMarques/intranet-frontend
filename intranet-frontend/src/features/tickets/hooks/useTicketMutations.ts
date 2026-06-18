import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi, TicketInput, MessageInput } from '../api/ticketsApi'

export function useTicketMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tickets'] })
  const create = useMutation({ mutationFn: (data: TicketInput) => ticketsApi.create(data), onSuccess: invalidate })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ticketsApi.updateStatus(id, status),
    onSuccess: invalidate,
  })
  const addMessage = useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: MessageInput }) => ticketsApi.addMessage(ticketId, data),
    onSuccess: invalidate,
  })
  const uploadAttachment = useMutation({
    mutationFn: ({ ticketId, file }: { ticketId: string; file: File }) => ticketsApi.uploadAttachment(ticketId, file),
    onSuccess: invalidate,
  })
  return { create, updateStatus, addMessage, uploadAttachment }
}
