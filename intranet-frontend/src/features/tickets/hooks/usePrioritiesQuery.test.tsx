import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { usePrioritiesQuery } from './usePrioritiesQuery'
import { prioritiesApi } from '../api/prioritiesApi'

jest.mock('../api/prioritiesApi', () => ({ prioritiesApi: { list: jest.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('usePrioritiesQuery', () => {
  it('returns data from the adapter', async () => {
    ;(prioritiesApi.list as jest.Mock).mockResolvedValue([{ name: 'High', level: 3 }])
    const { result } = renderHook(() => usePrioritiesQuery(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data ?? []).length).toBeGreaterThan(0)
  })
})
