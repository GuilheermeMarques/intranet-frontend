import { InMemoryBudgetsRepository } from 'test/repositories/in-memory-budgets-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Budget } from '../../enterprise/entities/budget'
import { BudgetItem } from '../../enterprise/entities/budget-item'
import { Product } from '../../enterprise/entities/product'
import { EditBudgetUseCase } from './edit-budget'

let budgetsRepository: InMemoryBudgetsRepository
let productsRepository: InMemoryProductsRepository
let sut: EditBudgetUseCase

function makeBudget(id: string) {
  return Budget.create(
    {
      number: 'ORC-2025-001',
      clientId: 'client-1',
      clientName: 'Acme',
      responsibleId: 'rep-1',
      responsibleName: 'John',
      items: [BudgetItem.create({ productName: 'Old', quantity: 1, unitPrice: 5 })],
    },
    new UniqueEntityID(id),
  )
}

describe('Edit Budget', () => {
  beforeEach(() => {
    budgetsRepository = new InMemoryBudgetsRepository()
    productsRepository = new InMemoryProductsRepository()
    sut = new EditBudgetUseCase(budgetsRepository, productsRepository)
  })

  it('patches status and validityDate', async () => {
    budgetsRepository.items.push(makeBudget('b1'))
    const validity = new Date('2025-12-31')

    const result = await sut.execute({ id: 'b1', status: 'approved', validityDate: validity })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.budget.status).toBe('approved')
      expect(result.value.budget.validityDate).toEqual(validity)
    }
  })

  it('replaces items, re-resolving product snapshots', async () => {
    budgetsRepository.items.push(makeBudget('b1'))
    productsRepository.items.push(
      Product.create(
        { code: 'PROD001', name: 'Widget', description: 'd', price: 10, stockQuantity: 1, supplier: 's' },
        new UniqueEntityID('product-1'),
      ),
    )

    const result = await sut.execute({ id: 'b1', items: [{ productId: 'product-1', quantity: 3 }] })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.budget.items).toHaveLength(1)
      expect(result.value.budget.items[0].productName).toBe('Widget')
      expect(result.value.budget.total).toBe(30)
    }
  })

  it('returns ResourceNotFoundError when budget is missing', async () => {
    const result = await sut.execute({ id: 'nope', status: 'approved' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
