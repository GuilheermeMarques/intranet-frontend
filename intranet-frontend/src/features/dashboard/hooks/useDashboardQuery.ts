import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboardApi';

export function useDashboardQuery() {
  return useQuery({ queryKey: ['dashboard-summary'], queryFn: () => dashboardApi.getSummary() });
}
