import { prioritiesApi } from './prioritiesApi';

describe('prioritiesApi', () => {
  it('returns all priorities', async () => {
    const result = await prioritiesApi.list();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('level');
  });
});
