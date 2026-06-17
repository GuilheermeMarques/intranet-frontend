import homeMock from '@/mocks/home.json';
import type { DashboardSummary } from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    await delay(0);
    return homeMock as DashboardSummary;
  },
};
