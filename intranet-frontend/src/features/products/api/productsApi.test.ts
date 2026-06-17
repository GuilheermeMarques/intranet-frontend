import { productsApi } from './productsApi';

describe('productsApi', () => {
  it('returns all products when no filters are given', async () => {
    const result = await productsApi.list();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('code');
    expect(result[0]).toHaveProperty('name');
  });

  it('filters by code (case-insensitive, partial)', async () => {
    const result = await productsApi.list({ code: 'prod001' });
    expect(result.every((p) => p.code.toLowerCase().includes('prod001'))).toBe(true);
  });

  it('filters by name (case-insensitive, partial)', async () => {
    const all = await productsApi.list();
    const term = all[0].name.slice(0, 3).toLowerCase();
    const result = await productsApi.list({ name: term });
    expect(result.every((p) => p.name.toLowerCase().includes(term))).toBe(true);
  });

  it('filters by supplier (case-insensitive, partial)', async () => {
    const all = await productsApi.list();
    const term = all[0].supplier.slice(0, 3).toLowerCase();
    const result = await productsApi.list({ supplier: term });
    expect(result.every((p) => p.supplier.toLowerCase().includes(term))).toBe(true);
  });

  it('returns a single product by id (coercing types)', async () => {
    const all = await productsApi.list();
    const id = all[0].id;
    const product = await productsApi.getById(id);
    expect(String(product?.id)).toBe(String(id));
  });
});
