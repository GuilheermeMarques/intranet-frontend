import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useDashboardQuery } from './useDashboardQuery';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useDashboardQuery', () => {
  it('loads the dashboard summary through the adapter', async () => {
    const { result } = renderHook(() => useDashboardQuery(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data?.stats ?? []).length).toBeGreaterThan(0);
  });
});
