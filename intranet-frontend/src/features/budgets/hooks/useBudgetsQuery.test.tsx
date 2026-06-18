import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useBudgetsQuery } from './useBudgetsQuery'
import { budgetsApi } from '../api/budgetsApi'

jest.mock('../api/budgetsApi', () => ({ budgetsApi: { list: jest.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useBudgetsQuery', () => {
  it('returns data from the adapter', async () => {
    ;(budgetsApi.list as jest.Mock).mockResolvedValue({
      budgets: [{ id: 'b1' }],
      clients: [{ value: 'c1', label: 'Acme' }],
      responsibles: [{ value: 'r1', label: 'John' }],
      activeRepresentatives: [{ value: 'r1', label: 'John' }],
    })
    const { result } = renderHook(
      () =>
        useBudgetsQuery({
          budgetNumber: '',
          clientId: '',
          responsibleId: '',
          status: '',
          startDate: null,
          endDate: null,
        }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect((result.current.data?.budgets ?? []).length).toBeGreaterThan(0)
    expect(Array.isArray(result.current.data?.clients)).toBe(true)
  })
})
