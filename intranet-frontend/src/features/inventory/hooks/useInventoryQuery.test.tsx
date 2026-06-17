import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useInventoryQuery } from './useInventoryQuery';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useInventoryQuery', () => {
  it('loads movements, types and reasons through the adapter', async () => {
    const { result } = renderHook(
      () => useInventoryQuery({ productCode: '', description: '', type: '', startDate: null, endDate: null }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data?.movements ?? []).length).toBeGreaterThan(0);
    expect(result.current.data?.types).toEqual(['inbound', 'outbound']);
  });
});
