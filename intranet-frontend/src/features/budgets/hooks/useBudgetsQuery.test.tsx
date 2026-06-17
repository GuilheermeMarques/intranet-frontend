import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useBudgetsQuery } from './useBudgetsQuery';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useBudgetsQuery', () => {
  it('loads normalized budgets and option lists through the adapter', async () => {
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
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data?.budgets ?? []).length).toBeGreaterThan(0);
    expect(Array.isArray(result.current.data?.clients)).toBe(true);
  });
});
