import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useClientsQuery } from './useClientsQuery';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useClientsQuery', () => {
  it('loads clients and cities through the api adapter', async () => {
    const { result } = renderHook(
      () => useClientsQuery({ code: '', name: '', city: '', startDate: null, endDate: null }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.clients.length).toBeGreaterThan(0);
    expect(Array.isArray(result.current.data?.cities)).toBe(true);
  });
});
