import { budgetsApi } from './budgetsApi';

describe('budgetsApi', () => {
  it('normalizes denormalized budgets into the Budget contract', async () => {
    const { budgets } = await budgetsApi.list();
    expect(budgets.length).toBeGreaterThan(0);
    const b = budgets[0];
    expect(typeof b.clientName).toBe('string');
    expect(typeof b.clientId).toBe('string');
    expect(typeof b.responsibleName).toBe('string');
    expect(b.items[0]).toHaveProperty('productName');
    expect(b.items[0]).toHaveProperty('productId');
  });

  it('derives clients, responsibles and activeRepresentatives option lists', async () => {
    const data = await budgetsApi.list();
    expect(data.clients.every((o) => o.value && o.label)).toBe(true);
    expect(data.responsibles.every((o) => o.value && o.label)).toBe(true);
    expect(Array.isArray(data.activeRepresentatives)).toBe(true);
  });

  it('filters by budgetNumber (case-insensitive, partial)', async () => {
    const all = await budgetsApi.list();
    const term = all.budgets[0].number.slice(0, 3).toLowerCase();
    const { budgets } = await budgetsApi.list({ budgetNumber: term });
    expect(budgets.every((b) => b.number.toLowerCase().includes(term))).toBe(true);
  });

  it('filters by exact clientId', async () => {
    const all = await budgetsApi.list();
    const clientId = all.budgets[0].clientId;
    const { budgets } = await budgetsApi.list({ clientId });
    expect(budgets.every((b) => b.clientId === clientId)).toBe(true);
  });

  it('filters by exact status', async () => {
    const all = await budgetsApi.list();
    const status = all.budgets[0].status;
    const { budgets } = await budgetsApi.list({ status });
    expect(budgets.every((b) => b.status === status)).toBe(true);
  });

  it('filters by createdAt date range (inclusive)', async () => {
    const start = new Date('2000-01-01');
    const end = new Date('2100-01-01');
    const { budgets } = await budgetsApi.list({ startDate: start, endDate: end });
    expect(budgets.length).toBeGreaterThan(0);
  });

  it('keeps option lists derived from the FULL set regardless of filters', async () => {
    const all = await budgetsApi.list();
    const filtered = await budgetsApi.list({ status: all.budgets[0].status });
    expect(filtered.clients.length).toBe(all.clients.length);
    expect(filtered.responsibles.length).toBe(all.responsibles.length);
  });
});
