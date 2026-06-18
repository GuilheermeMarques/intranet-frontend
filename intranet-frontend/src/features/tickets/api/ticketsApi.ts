import { httpClient } from '@/services/httpClient'
import type { Ticket, Message, Attachment } from '../types'

const statusConfig = {
  todo: { label: 'ToDo', color: '#ff9800' },
  inProgress: { label: 'InProgress', color: '#2196f3' },
  inReview: { label: 'In Review', color: '#9c27b0' },
  done: { label: 'Done', color: '#4caf50' },
}

export interface TicketsData {
  tickets: Ticket[]
  statusConfig: typeof statusConfig
}

export interface TicketInput {
  title: string
  description: string
  priorityId: string
  assignee: string
  reporter: string
  category: string
  tags: string[]
}

export interface MessageInput {
  author: string
  content: string
  type?: string
  mentions?: string[]
}

export const ticketsApi = {
  async list(): Promise<TicketsData> {
    const { tickets } = await httpClient.get<{ tickets: Ticket[] }>('/tickets')
    return { tickets, statusConfig }
  },
  async create(data: TicketInput): Promise<Ticket> {
    const { ticket } = await httpClient.post<{ ticket: Ticket }>('/tickets', data)
    return ticket
  },
  async updateStatus(id: string, status: string): Promise<Ticket> {
    const { ticket } = await httpClient.patch<{ ticket: Ticket }>(`/tickets/${id}`, { status })
    return ticket
  },
  async addMessage(ticketId: string, data: MessageInput): Promise<Message> {
    const { message } = await httpClient.post<{ message: Message }>(`/tickets/${ticketId}/messages`, data)
    return message
  },
  async uploadAttachment(ticketId: string, file: File): Promise<Attachment> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`/api/backend/tickets/${ticketId}/attachments`, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.message ?? 'Falha no upload do anexo.')
    }
    const { attachment } = await res.json()
    return attachment as Attachment
  },
}
