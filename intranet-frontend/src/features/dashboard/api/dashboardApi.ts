import { httpClient } from '@/services/httpClient'
import type { DashboardSummary } from '../types'

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    return httpClient.get<DashboardSummary>('/dashboard/summary')
  },
}
