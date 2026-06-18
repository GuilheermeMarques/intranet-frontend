import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useInventoryQuery } from './useInventoryQuery'
import { inventoryApi } from '../api/inventoryApi'

jest.mock('../api/inventoryApi', () => ({ inventoryApi: { list: jest.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useInventoryQuery', () => {
  it('returns data from the adapter', async () => {
    ;(inventoryApi.list as jest.Mock).mockResolvedValue({
      movements: [{ id: '1' }],
      types: ['inbound', 'outbound'],
      reasons: ['x'],
    })
    const { result } = renderHook(
      () => useInventoryQuery({ productCode: '', description: '', type: '', startDate: null, endDate: null }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data?.movements ?? []).length).toBeGreaterThan(0)
    expect(result.current.data?.types).toEqual(['inbound', 'outbound'])
  })
})
