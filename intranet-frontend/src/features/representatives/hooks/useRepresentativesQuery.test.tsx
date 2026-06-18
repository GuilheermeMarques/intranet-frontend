import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useRepresentativesQuery } from './useRepresentativesQuery'
import { representativesApi } from '../api/representativesApi'

jest.mock('../api/representativesApi', () => ({ representativesApi: { list: jest.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useRepresentativesQuery', () => {
  it('returns data from the adapter', async () => {
    ;(representativesApi.list as jest.Mock).mockResolvedValue({
      representatives: [{ id: '1', name: 'Ana' }],
      regions: ['South'],
      statusOptions: [{ value: 'active', label: 'Active' }],
    })
    const { result } = renderHook(
      () => useRepresentativesQuery({ name: '', region: '', status: '' }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data?.representatives ?? []).length).toBeGreaterThan(0)
    expect(Array.isArray(result.current.data?.regions)).toBe(true)
  })
})
