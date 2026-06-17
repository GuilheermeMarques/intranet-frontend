import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useTagsQuery } from './useTagsQuery';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useTagsQuery', () => {
  it('loads tags through the adapter', async () => {
    const { result } = renderHook(() => useTagsQuery(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data ?? []).length).toBeGreaterThan(0);
  });
});
