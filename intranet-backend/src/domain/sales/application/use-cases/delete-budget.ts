import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { BudgetsRepository } from '../repositories/budgets-repository'

interface DeleteBudgetUseCaseRequest {
  id: string
}

type DeleteBudgetUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class DeleteBudgetUseCase {
  constructor(private budgetsRepository: BudgetsRepository) {}

  async execute({ id }: DeleteBudgetUseCaseRequest): Promise<DeleteBudgetUseCaseResponse> {
    const budget = await this.budgetsRepository.findById(id)
    if (!budget) return left(new ResourceNotFoundError())
    await this.budgetsRepository.delete(budget)
    return right(null)
  }
}
