import { InMemoryBudgetsRepository } from 'test/repositories/in-memory-budgets-repository'
import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { InMemoryRepresentativesRepository } from 'test/repositories/in-memory-representatives-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Client } from '../../enterprise/entities/client'
import { Product } from '../../enterprise/entities/product'
import { Representative } from '../../enterprise/entities/representative'
import { CreateBudgetUseCase } from './create-budget'

let budgetsRepository: InMemoryBudgetsRepository
let clientsRepository: InMemoryClientsRepository
let productsRepository: InMemoryProductsRepository
let representativesRepository: InMemoryRepresentativesRepository
let sut: CreateBudgetUseCase

function makeClient(id: string) {
  return Client.create(
    {
      code: 'CLI001',
      name: 'Acme Corp',
      document: '12345678000190',
      zipCode: '00000-000',
      street: 'Main St',
      city: 'Sao Paulo',
      state: 'SP',
      neighborhood: 'Centro',
      number: '100',
      complement: '',
      email: 'acme@example.com',
      phone: '11999999999',
      instagram: '@acme',
    },
    new UniqueEntityID(id),
  )
}

function makeProduct(id: string) {
  return Product.create(
    {
      code: 'PROD001',
      name: 'Widget',
      description: 'A widget',
      price: 10,
      stockQuantity: 100,
      supplier: 'Supplier',
    },
    new UniqueEntityID(id),
  )
}

function makeRepresentative(id: string) {
  return Representative.create(
    {
      name: 'John Rep',
      email: 'john@example.com',
      phone: '11888888888',
      region: 'Sul',
      status: 'active',
      totalSales: 0,
      monthlyGoal: 0,
      clientsCount: 0,
    },
    new UniqueEntityID(id),
  )
}

describe('Create Budget', () => {
  beforeEach(() => {
    budgetsRepository = new InMemoryBudgetsRepository()
    clientsRepository = new InMemoryClientsRepository()
    productsRepository = new InMemoryProductsRepository()
    representativesRepository = new InMemoryRepresentativesRepository()
    sut = new CreateBudgetUseCase(
      budgetsRepository,
      clientsRepository,
      representativesRepository,
      productsRepository,
    )
  })

  it('creates a budget with resolved snapshots and computed totals', async () => {
    clientsRepository.items.push(makeClient('client-1'))
    representativesRepository.items.push(makeRepresentative('rep-1'))
    productsRepository.items.push(makeProduct('product-1'))

    const result = await sut.execute({
      clientId: 'client-1',
      responsibleId: 'rep-1',
      items: [{ productId: 'product-1', quantity: 3 }],
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { budget } = result.value
      expect(budget.number).toBe('ORC-2025-001')
      expect(budget.clientName).toBe('Acme Corp')
      expect(budget.responsibleName).toBe('John Rep')
      expect(budget.status).toBe('pending')

      const item = budget.items[0]
      expect(item.productName).toBe('Widget')
      expect(item.unitPrice).toBe(10)
      expect(item.total).toBe(30)

      expect(budget.total).toBe(30)
    }
    expect(budgetsRepository.items).toHaveLength(1)
  })

  it('returns ResourceNotFoundError when client is missing', async () => {
    representativesRepository.items.push(makeRepresentative('rep-1'))
    productsRepository.items.push(makeProduct('product-1'))

    const result = await sut.execute({
      clientId: 'nope',
      responsibleId: 'rep-1',
      items: [{ productId: 'product-1', quantity: 1 }],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('returns ResourceNotFoundError when representative is missing', async () => {
    clientsRepository.items.push(makeClient('client-1'))
    productsRepository.items.push(makeProduct('product-1'))

    const result = await sut.execute({
      clientId: 'client-1',
      responsibleId: 'nope',
      items: [{ productId: 'product-1', quantity: 1 }],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('returns ResourceNotFoundError when product is missing', async () => {
    clientsRepository.items.push(makeClient('client-1'))
    representativesRepository.items.push(makeRepresentative('rep-1'))

    const result = await sut.execute({
      clientId: 'client-1',
      responsibleId: 'rep-1',
      items: [{ productId: 'nope', quantity: 1 }],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
