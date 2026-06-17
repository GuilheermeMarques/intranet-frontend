import { ticketsApi } from './ticketsApi';

describe('ticketsApi', () => {
  it('returns all tickets plus statusConfig', async () => {
    const result = await ticketsApi.list();
    expect(result.tickets.length).toBeGreaterThan(0);
    expect(result.tickets[0]).toHaveProperty('priority');
    expect(result.tickets[0]).toHaveProperty('tags');
    expect(result.statusConfig).toBeDefined();
  });
});
