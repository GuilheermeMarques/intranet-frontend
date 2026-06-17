import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useOrdersQuery } from './useOrdersQuery';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useOrdersQuery', () => {
  it('loads orders through the api adapter', async () => {
    const { result } = renderHook(
      () => useOrdersQuery({ orderCode: '', clientName: '', status: '' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data ?? []).length).toBeGreaterThan(0);
  });
});
