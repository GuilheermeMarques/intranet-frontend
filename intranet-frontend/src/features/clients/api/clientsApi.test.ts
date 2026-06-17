import { clientsApi } from './clientsApi';

describe('clientsApi', () => {
  it('returns all clients when no filters are given', async () => {
    const result = await clientsApi.list();
    expect(result.clients.length).toBeGreaterThan(0);
    expect(result.clients[0]).toHaveProperty('code');
    expect(result.clients[0]).toHaveProperty('name');
  });

  it('derives a deduplicated, sorted list of cities', async () => {
    const { cities } = await clientsApi.list();
    expect(cities).toEqual([...new Set(cities)].sort());
  });

  it('filters by code (case-insensitive, partial)', async () => {
    const { clients } = await clientsApi.list({ code: 'cli001' });
    expect(clients.every((c) => c.code.toLowerCase().includes('cli001'))).toBe(true);
  });

  it('filters by exact city', async () => {
    const all = await clientsApi.list();
    const city = all.clients[0].city;
    const { clients } = await clientsApi.list({ city });
    expect(clients.every((c) => c.city === city)).toBe(true);
  });

  it('returns a single client by code', async () => {
    const all = await clientsApi.list();
    const code = all.clients[0].code;
    const client = await clientsApi.getByCode(code);
    expect(client?.code).toBe(code);
  });
});

describe('clientsApi date filtering', () => {
  // Mock data lastPurchaseAt spans 2024-01-02 .. 2024-01-30; 2024-01-15 splits it.
  it('keeps only clients whose lastPurchaseAt is on/after startDate', async () => {
    const startDate = new Date('2024-01-15');
    const { clients } = await clientsApi.list({ startDate, endDate: null });
    expect(clients.length).toBeGreaterThan(0);
    expect(
      clients.every((c) => c.lastPurchaseAt && new Date(c.lastPurchaseAt) >= startDate),
    ).toBe(true);
  });

  it('keeps only clients whose lastPurchaseAt is on/before endDate', async () => {
    const endDate = new Date('2024-01-15');
    const { clients } = await clientsApi.list({ startDate: null, endDate });
    expect(clients.length).toBeGreaterThan(0);
    expect(
      clients.every((c) => c.lastPurchaseAt && new Date(c.lastPurchaseAt) <= endDate),
    ).toBe(true);
  });

  it('keeps only clients within the range when both dates are set', async () => {
    const startDate = new Date('2024-01-10');
    const endDate = new Date('2024-01-20');
    const { clients } = await clientsApi.list({ startDate, endDate });
    expect(clients.length).toBeGreaterThan(0);
    expect(
      clients.every(
        (c) =>
          c.lastPurchaseAt &&
          new Date(c.lastPurchaseAt) >= startDate &&
          new Date(c.lastPurchaseAt) <= endDate,
      ),
    ).toBe(true);
  });

  it('excludes clients with null lastPurchaseAt when a date filter is set', async () => {
    const { clients } = await clientsApi.list({
      startDate: new Date('2000-01-01'),
      endDate: null,
    });
    expect(clients.every((c) => c.lastPurchaseAt !== null)).toBe(true);
  });

  it('applies no date filtering when both dates are null', async () => {
    const withoutDates = await clientsApi.list({ startDate: null, endDate: null });
    const all = await clientsApi.list();
    expect(withoutDates.clients.length).toBe(all.clients.length);
  });
});
