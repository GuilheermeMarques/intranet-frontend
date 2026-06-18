import { httpClient } from '@/services/httpClient'
import type { Ticket } from '../types'

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

export const ticketsApi = {
  async list(): Promise<TicketsData> {
    const { tickets } = await httpClient.get<{ tickets: Ticket[] }>('/tickets')
    return { tickets, statusConfig }
  },
}
