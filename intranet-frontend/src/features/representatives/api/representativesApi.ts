import { httpClient } from '@/services/httpClient'
import type { RepresentativeFilters, RepresentativesData } from '../types'

export const representativesApi = {
  async list(filters?: Partial<RepresentativeFilters>): Promise<RepresentativesData> {
    return httpClient.get<RepresentativesData>('/representatives', filters as Record<string, unknown> | undefined)
  },
}
