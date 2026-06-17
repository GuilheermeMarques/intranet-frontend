import {
  BudgetFilters,
  BudgetsRepository,
} from '@/domain/sales/application/repositories/budgets-repository'
import { Budget } from '@/domain/sales/enterprise/entities/budget'

export class InMemoryBudgetsRepository implements BudgetsRepository {
  public items: Budget[] = []

  async findMany(filters: BudgetFilters): Promise<Budget[]> {
    return this.items.filter((budget) => {
      if (
        filters.budgetNumber?.trim() &&
        !budget.number
          .toLowerCase()
          .includes(filters.budgetNumber.toLowerCase())
      )
        return false
      if (filters.clientId?.trim() && budget.clientId !== filters.clientId)
        return false
      if (
        filters.responsibleId?.trim() &&
        budget.responsibleId !== filters.responsibleId
      )
        return false
      if (filters.status?.trim() && budget.status !== filters.status)
        return false
      if (filters.startDate && budget.createdAt < filters.startDate)
        return false
      if (filters.endDate && budget.createdAt > filters.endDate) return false
      return true
    })
  }

  async findById(id: string) {
    return this.items.find((b) => b.id.toString() === id) ?? null
  }

  async count() {
    return this.items.length
  }

  async create(budget: Budget) {
    this.items.push(budget)
  }

  async save(budget: Budget) {
    const index = this.items.findIndex((b) => b.id.equals(budget.id))
    if (index >= 0) this.items[index] = budget
  }

  async delete(budget: Budget) {
    const index = this.items.findIndex((b) => b.id.equals(budget.id))
    if (index >= 0) this.items.splice(index, 1)
  }
}
