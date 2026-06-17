import { InMemoryBudgetsRepository } from 'test/repositories/in-memory-budgets-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Budget } from '../../enterprise/entities/budget'
import { BudgetItem } from '../../enterprise/entities/budget-item'
import { FetchBudgetsUseCase } from './fetch-budgets'

let budgetsRepository: InMemoryBudgetsRepository
let sut: FetchBudgetsUseCase

function makeBudget(id: string, overrides: Partial<{ number: string; clientId: string; status: Budget['status'] }> = {}) {
  return Budget.create(
    {
      number: overrides.number ?? 'ORC-2025-001',
      clientId: overrides.clientId ?? 'client-1',
      clientName: 'Acme',
      responsibleId: 'rep-1',
      responsibleName: 'John',
      status: overrides.status ?? 'pending',
      items: [
        BudgetItem.create({ productName: 'Widget', quantity: 2, unitPrice: 10 }),
      ],
    },
    new UniqueEntityID(id),
  )
}

describe('Fetch Budgets', () => {
  beforeEach(() => {
    budgetsRepository = new InMemoryBudgetsRepository()
    sut = new FetchBudgetsUseCase(budgetsRepository)
  })

  it('returns all budgets when no filters are given', async () => {
    budgetsRepository.items.push(makeBudget('b1'))
    budgetsRepository.items.push(makeBudget('b2', { number: 'ORC-2025-002', status: 'approved' }))

    const result = await sut.execute({ filters: {} })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) expect(result.value.budgets).toHaveLength(2)
  })

  it('filters by status', async () => {
    budgetsRepository.items.push(makeBudget('b1', { status: 'pending' }))
    budgetsRepository.items.push(makeBudget('b2', { number: 'ORC-2025-002', status: 'approved' }))

    const result = await sut.execute({ filters: { status: 'approved' } })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.budgets).toHaveLength(1)
      expect(result.value.budgets[0].status).toBe('approved')
    }
  })
})
