import { useQuery } from '@tanstack/react-query';
import { budgetsApi } from '../api/budgetsApi';
import type { BudgetFilters } from '../types';

export function useBudgetsQuery(filters: BudgetFilters) {
  return useQuery({
    queryKey: [
      'budgets',
      filters.budgetNumber,
      filters.clientId,
      filters.responsibleId,
      filters.status,
      filters.startDate?.getTime() ?? null,
      filters.endDate?.getTime() ?? null,
    ],
    queryFn: () => budgetsApi.list(filters),
  });
}
