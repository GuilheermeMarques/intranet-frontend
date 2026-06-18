import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useDashboardQuery } from './useDashboardQuery'
import { dashboardApi } from '../api/dashboardApi'

jest.mock('../api/dashboardApi', () => ({ dashboardApi: { getSummary: jest.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useDashboardQuery', () => {
  it('returns data from the adapter', async () => {
    ;(dashboardApi.getSummary as jest.Mock).mockResolvedValue({
      stats: [{ title: 'Orders' }],
      progress: [{ total: 10 }],
      recentActivity: [{ id: '1' }],
    })
    const { result } = renderHook(() => useDashboardQuery(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data?.stats ?? []).length).toBeGreaterThan(0)
  })
})
