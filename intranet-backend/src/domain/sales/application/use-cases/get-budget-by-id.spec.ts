import { InMemoryBudgetsRepository } from 'test/repositories/in-memory-budgets-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Budget } from '../../enterprise/entities/budget'
import { GetBudgetByIdUseCase } from './get-budget-by-id'

let budgetsRepository: InMemoryBudgetsRepository
let sut: GetBudgetByIdUseCase

function makeBudget(id: string) {
  return Budget.create(
    {
      number: 'ORC-2025-001',
      clientId: 'client-1',
      clientName: 'Acme',
      responsibleId: 'rep-1',
      responsibleName: 'John',
      items: [],
    },
    new UniqueEntityID(id),
  )
}

describe('Get Budget By Id', () => {
  beforeEach(() => {
    budgetsRepository = new InMemoryBudgetsRepository()
    sut = new GetBudgetByIdUseCase(budgetsRepository)
  })

  it('returns the budget', async () => {
    budgetsRepository.items.push(makeBudget('b1'))
    const result = await sut.execute({ id: 'b1' })
    expect(result.isRight()).toBe(true)
    if (result.isRight()) expect(result.value.budget.id.toString()).toBe('b1')
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
