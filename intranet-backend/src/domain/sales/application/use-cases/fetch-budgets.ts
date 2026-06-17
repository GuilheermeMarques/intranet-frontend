import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { BudgetFilters, BudgetsRepository } from '../repositories/budgets-repository'
import { Budget } from '../../enterprise/entities/budget'

interface FetchBudgetsUseCaseRequest {
  filters: BudgetFilters
}

type FetchBudgetsUseCaseResponse = Either<never, { budgets: Budget[] }>

@Injectable()
export class FetchBudgetsUseCase {
  constructor(private budgetsRepository: BudgetsRepository) {}

  async execute({ filters }: FetchBudgetsUseCaseRequest): Promise<FetchBudgetsUseCaseResponse> {
    const budgets = await this.budgetsRepository.findMany(filters)
    return right({ budgets })
  }
}
