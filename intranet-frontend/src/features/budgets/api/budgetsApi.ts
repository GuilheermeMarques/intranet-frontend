import { httpClient } from '@/services/httpClient'
import type { Budget, BudgetFilters, BudgetOption, BudgetsData } from '../types'

interface RawClient { id: string; name: string }
interface RawRepresentative { id: string; name: string; status: string }

export const budgetsApi = {
  async list(filters?: Partial<BudgetFilters>): Promise<BudgetsData> {
    const [budgetsRes, clientsRes, repsRes] = await Promise.all([
      httpClient.get<{ budgets: Budget[] }>('/budgets', filters as Record<string, unknown> | undefined),
      httpClient.get<{ clients: RawClient[] }>('/clients'),
      httpClient.get<{ representatives: RawRepresentative[] }>('/representatives'),
    ])

    const budgets = budgetsRes.budgets

    const clients: BudgetOption[] = clientsRes.clients
      .map((c) => ({ value: c.id, label: c.name }))
      .sort((a, b) => a.label.localeCompare(b.label))

    const responsibles: BudgetOption[] = Array.from(
      new Map(budgets.map((b) => [b.responsibleId, { value: b.responsibleId, label: b.responsibleName }])).values(),
    ).sort((a, b) => a.label.localeCompare(b.label))

    const activeRepresentatives: BudgetOption[] = repsRes.representatives
      .filter((r) => r.status === 'active')
      .map((r) => ({ value: r.id, label: r.name }))

    return { budgets, clients, responsibles, activeRepresentatives }
  },
}
