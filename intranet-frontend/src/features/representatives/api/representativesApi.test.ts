import { representativesApi } from './representativesApi';

describe('representativesApi', () => {
  it('returns all representatives plus regions and statusOptions when no filters', async () => {
    const result = await representativesApi.list();
    expect(result.representatives.length).toBeGreaterThan(0);
    expect(Array.isArray(result.regions)).toBe(true);
    expect(result.statusOptions[0]).toHaveProperty('value');
    expect(result.statusOptions[0]).toHaveProperty('label');
  });

  it('filters by name (case-insensitive, partial)', async () => {
    const all = await representativesApi.list();
    const term = all.representatives[0].name.slice(0, 3).toLowerCase();
    const { representatives } = await representativesApi.list({ name: term });
    expect(representatives.every((r) => r.name.toLowerCase().includes(term))).toBe(true);
  });

  it('filters by exact region', async () => {
    const all = await representativesApi.list();
    const region = all.representatives[0].region;
    const { representatives } = await representativesApi.list({ region });
    expect(representatives.every((r) => r.region === region)).toBe(true);
  });

  it('filters by exact status', async () => {
    const all = await representativesApi.list();
    const status = all.representatives[0].status;
    const { representatives } = await representativesApi.list({ status });
    expect(representatives.every((r) => r.status === status)).toBe(true);
  });
});
