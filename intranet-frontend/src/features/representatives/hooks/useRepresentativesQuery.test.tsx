import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useRepresentativesQuery } from './useRepresentativesQuery';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useRepresentativesQuery', () => {
  it('loads representatives, regions and statusOptions through the adapter', async () => {
    const { result } = renderHook(
      () => useRepresentativesQuery({ name: '', region: '', status: '' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data?.representatives ?? []).length).toBeGreaterThan(0);
    expect(Array.isArray(result.current.data?.regions)).toBe(true);
  });
});
