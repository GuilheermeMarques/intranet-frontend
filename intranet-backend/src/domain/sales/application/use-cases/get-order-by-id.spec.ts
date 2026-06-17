import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Order } from '../../enterprise/entities/order'
import { GetOrderByIdUseCase } from './get-order-by-id'

let ordersRepository: InMemoryOrdersRepository
let sut: GetOrderByIdUseCase

function makeOrder(id: string) {
  return Order.create(
    {
      orderCode: 'PED-001',
      clientCode: 'CLI001',
      clientName: 'Acme Corp',
      items: [],
    },
    new UniqueEntityID(id),
  )
}

describe('Get Order By Id', () => {
  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    sut = new GetOrderByIdUseCase(ordersRepository)
  })

  it('returns the order', async () => {
    ordersRepository.items.push(makeOrder('order-1'))

    const result = await sut.execute({ id: 'order-1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.id.toString()).toBe('order-1')
    }
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
