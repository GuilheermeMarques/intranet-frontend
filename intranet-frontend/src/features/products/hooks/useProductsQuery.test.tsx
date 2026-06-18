import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useProductsQuery } from './useProductsQuery'
import { productsApi } from '../api/productsApi'

jest.mock('../api/productsApi', () => ({ productsApi: { list: jest.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useProductsQuery', () => {
  it('returns data from the adapter', async () => {
    ;(productsApi.list as jest.Mock).mockResolvedValue([{ id: 1, code: 'PROD001' }])
    const { result } = renderHook(
      () => useProductsQuery({ code: '', name: '', supplier: '' }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data ?? []).length).toBeGreaterThan(0)
  })
})
