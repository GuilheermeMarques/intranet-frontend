import { useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetsApi, BudgetInput } from '../api/budgetsApi'

export function useBudgetMutations() {
  const queryClient = useQueryClient()
  const create = useMutation({
    mutationFn: (data: BudgetInput) => budgetsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  })
  return { create }
}
