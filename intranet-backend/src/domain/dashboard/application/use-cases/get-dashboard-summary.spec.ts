import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { InMemoryBudgetsRepository } from 'test/repositories/in-memory-budgets-repository'
import { InMemoryTicketsRepository } from 'test/repositories/in-memory-tickets-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Client } from '@/domain/sales/enterprise/entities/client'
import { Product } from '@/domain/sales/enterprise/entities/product'
import { Budget } from '@/domain/sales/enterprise/entities/budget'
import { Ticket } from '@/domain/support/enterprise/entities/ticket'
import { GetDashboardSummaryUseCase } from './get-dashboard-summary'

let clientsRepository: InMemoryClientsRepository
let productsRepository: InMemoryProductsRepository
let budgetsRepository: InMemoryBudgetsRepository
let ticketsRepository: InMemoryTicketsRepository
let sut: GetDashboardSummaryUseCase

function makeClient(id: string) {
  return Client.create(
    {
      code: `CLI${id}`,
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
      code: `PROD${id}`,
      name: 'Widget',
      description: 'A widget',
      price: 10,
      stockQuantity: 100,
      supplier: 'Supplier',
    },
    new UniqueEntityID(id),
  )
}

function makeBudget(id: string) {
  return Budget.create(
    {
      number: `ORC-2025-${id}`,
      clientId: 'client-1',
      clientName: 'Acme',
      responsibleId: 'rep-1',
      responsibleName: 'John',
      items: [],
    },
    new UniqueEntityID(id),
  )
}

function makeTicket(
  id: string,
  status: 'todo' | 'inProgress' | 'inReview' | 'done' = 'todo',
) {
  return Ticket.create(
    {
      title: `Ticket ${id}`,
      description: 'Something is broken',
      priorityId: 'p1',
      assignee: 'Alice',
      reporter: 'Bob',
      category: 'Auth',
      status,
    },
    new UniqueEntityID(id),
  )
}

describe('Get Dashboard Summary', () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository()
    productsRepository = new InMemoryProductsRepository()
    budgetsRepository = new InMemoryBudgetsRepository()
    ticketsRepository = new InMemoryTicketsRepository()
    sut = new GetDashboardSummaryUseCase(
      clientsRepository,
      productsRepository,
      budgetsRepository,
      ticketsRepository,
    )
  })

  it('aggregates counts across domains', async () => {
    clientsRepository.items.push(makeClient('1'), makeClient('2'))
    productsRepository.items.push(makeProduct('1'))
    budgetsRepository.items.push(makeBudget('1'))
    ticketsRepository.items.push(
      makeTicket('1', 'todo'),
      makeTicket('2', 'done'),
    )

    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { stats, progress, recentActivity } = result.value

      expect(stats).toHaveLength(4)
      expect(stats[0].value).toBe('2')
      expect(stats[1].value).toBe('1')
      expect(stats[2].value).toBe('1')
      expect(stats[3].value).toBe('2')

      expect(progress).toHaveLength(1)
      expect(progress[0].value).toBe(1)
      expect(progress[0].total).toBe(2)

      expect(recentActivity).toHaveLength(2)
      expect(recentActivity[0].type).toBe('ticket')
    }
  })
})
