import { Budget } from '../../enterprise/entities/budget'

export interface BudgetFilters {
  budgetNumber?: string
  clientId?: string
  responsibleId?: string
  status?: string
  startDate?: Date | null
  endDate?: Date | null
}

export abstract class BudgetsRepository {
  abstract findMany(filters: BudgetFilters): Promise<Budget[]>
  abstract findById(id: string): Promise<Budget | null>
  abstract count(): Promise<number>
  abstract create(budget: Budget): Promise<void>
  abstract save(budget: Budget): Promise<void>
  abstract delete(budget: Budget): Promise<void>
}
