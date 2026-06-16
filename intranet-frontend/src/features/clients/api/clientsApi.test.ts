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
