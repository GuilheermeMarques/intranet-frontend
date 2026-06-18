import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useTagsQuery } from './useTagsQuery'
import { tagsApi } from '../api/tagsApi'

jest.mock('../api/tagsApi', () => ({ tagsApi: { list: jest.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useTagsQuery', () => {
  it('returns data from the adapter', async () => {
    ;(tagsApi.list as jest.Mock).mockResolvedValue([{ name: 'bug', color: '#f00' }])
    const { result } = renderHook(() => useTagsQuery(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data ?? []).length).toBeGreaterThan(0)
  })
})
