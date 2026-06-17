import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { BudgetsRepository } from '../repositories/budgets-repository'
import { Budget } from '../../enterprise/entities/budget'

interface GetBudgetByIdUseCaseRequest {
  id: string
}

type GetBudgetByIdUseCaseResponse = Either<ResourceNotFoundError, { budget: Budget }>

@Injectable()
export class GetBudgetByIdUseCase {
  constructor(private budgetsRepository: BudgetsRepository) {}

  async execute({ id }: GetBudgetByIdUseCaseRequest): Promise<GetBudgetByIdUseCaseResponse> {
    const budget = await this.budgetsRepository.findById(id)
    if (!budget) return left(new ResourceNotFoundError())
    return right({ budget })
  }
}
