import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useOrdersQuery } from './useOrdersQuery'
import { ordersApi } from '../api/ordersApi'

jest.mock('../api/ordersApi', () => ({ ordersApi: { list: jest.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useOrdersQuery', () => {
  it('returns data from the adapter', async () => {
    ;(ordersApi.list as jest.Mock).mockResolvedValue([{ id: 'ORD001' }])
    const { result } = renderHook(
      () => useOrdersQuery({ orderCode: '', clientName: '', status: '' }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data ?? []).length).toBeGreaterThan(0)
  })
})
