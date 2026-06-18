import { httpClient } from '@/services/httpClient'
import type { Priority } from '../types'

export const prioritiesApi = {
  async list(): Promise<Priority[]> {
    const { priorities } = await httpClient.get<{ priorities: Priority[] }>('/ticket-priorities')
    return priorities
  },
}
