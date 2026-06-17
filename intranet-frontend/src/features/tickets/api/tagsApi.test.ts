import { tagsApi } from './tagsApi';

describe('tagsApi', () => {
  it('returns all tags', async () => {
    const result = await tagsApi.list();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('color');
  });
});
