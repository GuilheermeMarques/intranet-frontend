import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Order } from '../../enterprise/entities/order'
import { ChangeOrderStatusUseCase } from './change-order-status'

let ordersRepository: InMemoryOrdersRepository
let sut: ChangeOrderStatusUseCase

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

describe('Change Order Status', () => {
  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    sut = new ChangeOrderStatusUseCase(ordersRepository)
  })

  it('changes the status', async () => {
    ordersRepository.items.push(makeOrder('order-1'))

    const result = await sut.execute({ id: 'order-1', status: 'shipped' })

    expect(result.isRight()).toBe(true)
    expect(ordersRepository.items[0].status).toBe('shipped')
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope', status: 'shipped' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
