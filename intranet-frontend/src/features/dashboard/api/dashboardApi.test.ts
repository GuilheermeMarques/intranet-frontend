import { dashboardApi } from './dashboardApi';

describe('dashboardApi', () => {
  it('returns the dashboard summary with stats, progress and recentActivity', async () => {
    const result = await dashboardApi.getSummary();
    expect(result.stats.length).toBeGreaterThan(0);
    expect(result.progress.length).toBeGreaterThan(0);
    expect(result.recentActivity.length).toBeGreaterThan(0);
    expect(result.stats[0]).toHaveProperty('title');
    expect(result.progress[0]).toHaveProperty('total');
  });
});
