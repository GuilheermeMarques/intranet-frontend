import { inventoryApi } from './inventoryApi';

describe('inventoryApi', () => {
  it('returns all movements plus types and reasons when no filters', async () => {
    const result = await inventoryApi.list();
    expect(result.movements.length).toBeGreaterThan(0);
    expect(result.types).toEqual(['inbound', 'outbound']);
    expect(result.reasons.length).toBeGreaterThan(0);
    expect(result.movements[0]).toHaveProperty('productCode');
    expect(result.movements[0]).toHaveProperty('type');
  });

  it('filters by productCode (case-insensitive, partial)', async () => {
    const all = await inventoryApi.list();
    const term = all.movements[0].productCode.slice(0, 4).toLowerCase();
    const { movements } = await inventoryApi.list({ productCode: term });
    expect(movements.every((m) => m.productCode.toLowerCase().includes(term))).toBe(true);
  });

  it('filters by description (case-insensitive, partial)', async () => {
    const all = await inventoryApi.list();
    const term = all.movements[0].description.slice(0, 4).toLowerCase();
    const { movements } = await inventoryApi.list({ description: term });
    expect(movements.every((m) => m.description.toLowerCase().includes(term))).toBe(true);
  });

  it('filters by exact type', async () => {
    const { movements } = await inventoryApi.list({ type: 'inbound' });
    expect(movements.every((m) => m.type === 'inbound')).toBe(true);
  });

  it('filters by date range on occurredAt (inclusive)', async () => {
    const start = new Date('2024-01-01');
    const end = new Date('2024-12-31');
    const { movements } = await inventoryApi.list({ startDate: start, endDate: end });
    expect(movements.every((m) => {
      const d = new Date(m.occurredAt);
      return d >= start && d <= end;
    })).toBe(true);
  });

  it('applies no date filtering when both dates are null', async () => {
    const filtered = await inventoryApi.list({ startDate: null, endDate: null });
    const all = await inventoryApi.list();
    expect(filtered.movements.length).toBe(all.movements.length);
  });
});
