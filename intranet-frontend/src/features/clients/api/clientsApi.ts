import { httpClient, ApiError } from '@/services/httpClient'
import type { Client, ClientFilters, ClientsData } from '../types'

export const clientsApi = {
  async list(filters?: Partial<ClientFilters>): Promise<ClientsData> {
    return httpClient.get<ClientsData>('/clients', filters as Record<string, unknown> | undefined)
  },

  async getByCode(code: string): Promise<Client | null> {
    try {
      const { client } = await httpClient.get<{ client: Client }>(`/clients/code/${code}`)
      return client
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },
}
