import { httpClient } from '@/services/httpClient'
import type { Priority } from '../types'

export interface PriorityInput {
  name: string
  color: string
  level: number
  description?: string
  isActive?: boolean
}

export const prioritiesApi = {
  async list(): Promise<Priority[]> {
    const { priorities } = await httpClient.get<{ priorities: Priority[] }>('/ticket-priorities')
    return priorities
  },
  async create(data: PriorityInput): Promise<Priority> {
    const { priority } = await httpClient.post<{ priority: Priority }>('/ticket-priorities', data)
    return priority
  },
  async update(id: string, data: Partial<PriorityInput>): Promise<Priority> {
    const { priority } = await httpClient.patch<{ priority: Priority }>(`/ticket-priorities/${id}`, data)
    return priority
  },
  async remove(id: string): Promise<void> {
    await httpClient.delete(`/ticket-priorities/${id}`)
  },
}
