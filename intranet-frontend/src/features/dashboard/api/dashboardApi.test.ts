import { dashboardApi } from './dashboardApi'
import { httpClient } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock

describe('dashboardApi', () => {
  beforeEach(() => mockGet.mockReset())

  it('getSummary() calls GET /dashboard/summary and returns the summary as-is', async () => {
    mockGet.mockResolvedValue({
      stats: [{ title: 'Orders' }],
      progress: [{ total: 10 }],
      recentActivity: [{ id: '1' }],
    })
    const result = await dashboardApi.getSummary()
    expect(mockGet).toHaveBeenCalledWith('/dashboard/summary')
    expect(result.stats.length).toBeGreaterThan(0)
    expect(result.progress.length).toBeGreaterThan(0)
    expect(result.recentActivity.length).toBeGreaterThan(0)
    expect(result.stats[0]).toHaveProperty('title')
    expect(result.progress[0]).toHaveProperty('total')
  })
})
