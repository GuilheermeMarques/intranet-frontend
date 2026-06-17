import { InMemoryBudgetsRepository } from 'test/repositories/in-memory-budgets-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Budget } from '../../enterprise/entities/budget'
import { DeleteBudgetUseCase } from './delete-budget'

let budgetsRepository: InMemoryBudgetsRepository
let sut: DeleteBudgetUseCase

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

describe('Delete Budget', () => {
  beforeEach(() => {
    budgetsRepository = new InMemoryBudgetsRepository()
    sut = new DeleteBudgetUseCase(budgetsRepository)
  })

  it('deletes the budget', async () => {
    budgetsRepository.items.push(makeBudget('b1'))
    const result = await sut.execute({ id: 'b1' })
    expect(result.isRight()).toBe(true)
    expect(budgetsRepository.items).toHaveLength(0)
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
