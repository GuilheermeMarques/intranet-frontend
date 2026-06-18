import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useClientsQuery } from './useClientsQuery'
import { clientsApi } from '../api/clientsApi'

jest.mock('../api/clientsApi', () => ({ clientsApi: { list: jest.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useClientsQuery', () => {
  it('returns data from the adapter', async () => {
    ;(clientsApi.list as jest.Mock).mockResolvedValue({ clients: [{ code: 'CLI001' }], cities: ['SP'] })
    const { result } = renderHook(
      () => useClientsQuery({ code: '', name: '', city: '', startDate: null, endDate: null }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.clients).toHaveLength(1)
  })
})
