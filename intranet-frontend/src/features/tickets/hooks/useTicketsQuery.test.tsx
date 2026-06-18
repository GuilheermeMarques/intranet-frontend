import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useTicketsQuery } from './useTicketsQuery'
import { ticketsApi } from '../api/ticketsApi'

jest.mock('../api/ticketsApi', () => ({ ticketsApi: { list: jest.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useTicketsQuery', () => {
  it('returns data from the adapter', async () => {
    ;(ticketsApi.list as jest.Mock).mockResolvedValue({
      tickets: [{ id: '1' }],
      statusConfig: { todo: { label: 'ToDo', color: '#ff9800' } },
    })
    const { result } = renderHook(() => useTicketsQuery(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data?.tickets ?? []).length).toBeGreaterThan(0)
  })
})
