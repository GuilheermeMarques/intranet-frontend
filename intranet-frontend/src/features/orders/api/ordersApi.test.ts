import { ordersApi } from './ordersApi';

describe('ordersApi', () => {
  it('returns all orders when no filters are given', async () => {
    const result = await ordersApi.list();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('clientName');
    expect(result[0]).toHaveProperty('status');
  });

  it('filters by orderCode against the order id (case-insensitive, partial)', async () => {
    const all = await ordersApi.list();
    const term = all[0].id.slice(0, 3).toLowerCase();
    const result = await ordersApi.list({ orderCode: term });
    expect(result.every((o) => o.id.toLowerCase().includes(term))).toBe(true);
  });

  it('filters by clientName (case-insensitive, partial)', async () => {
    const all = await ordersApi.list();
    const term = all[0].clientName.slice(0, 3).toLowerCase();
    const result = await ordersApi.list({ clientName: term });
    expect(result.every((o) => o.clientName.toLowerCase().includes(term))).toBe(true);
  });

  it('filters by exact status', async () => {
    const all = await ordersApi.list();
    const status = all[0].status;
    const result = await ordersApi.list({ status });
    expect(result.every((o) => o.status === status)).toBe(true);
  });

  it('returns a single order by id', async () => {
    const all = await ordersApi.list();
    const id = all[0].id;
    const order = await ordersApi.getById(id);
    expect(order?.id).toBe(id);
  });
});
