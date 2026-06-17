import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Order, OrderStatus } from '../../enterprise/entities/order'
import { FetchOrdersUseCase } from './fetch-orders'

let ordersRepository: InMemoryOrdersRepository
let sut: FetchOrdersUseCase

function makeOrder(id: string, clientName: string, status: OrderStatus) {
  return Order.create(
    {
      orderCode: `PED-${id}`,
      clientCode: 'CLI001',
      clientName,
      items: [],
      status,
    },
    new UniqueEntityID(id),
  )
}

describe('Fetch Orders', () => {
  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    sut = new FetchOrdersUseCase(ordersRepository)
  })

  it('filters by status and clientName', async () => {
    ordersRepository.items.push(makeOrder('1', 'Acme Corp', 'pending'))
    ordersRepository.items.push(makeOrder('2', 'Acme Corp', 'shipped'))
    ordersRepository.items.push(makeOrder('3', 'Other Co', 'shipped'))

    const result = await sut.execute({
      filters: { clientName: 'acme', status: 'shipped' },
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.orders).toHaveLength(1)
      expect(result.value.orders[0].id.toString()).toBe('2')
    }
  })
})
