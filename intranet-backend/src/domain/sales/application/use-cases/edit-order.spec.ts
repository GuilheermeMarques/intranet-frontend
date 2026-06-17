import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Order } from '../../enterprise/entities/order'
import { OrderItem } from '../../enterprise/entities/order-item'
import { Product } from '../../enterprise/entities/product'
import { EditOrderUseCase } from './edit-order'

let ordersRepository: InMemoryOrdersRepository
let productsRepository: InMemoryProductsRepository
let sut: EditOrderUseCase

function makeProduct(id: string) {
  return Product.create(
    {
      code: 'PROD002',
      name: 'Gadget',
      description: 'A gadget',
      price: 20,
      stockQuantity: 50,
      supplier: 'Supplier',
    },
    new UniqueEntityID(id),
  )
}

function makeOrder(id: string) {
  return Order.create(
    {
      orderCode: 'PED-001',
      clientCode: 'CLI001',
      clientName: 'Acme Corp',
      items: [
        OrderItem.create({
          productName: 'Widget',
          quantity: 1,
          unitPrice: 10,
        }),
      ],
      shippingCost: 0,
    },
    new UniqueEntityID(id),
  )
}

describe('Edit Order', () => {
  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    productsRepository = new InMemoryProductsRepository()
    sut = new EditOrderUseCase(ordersRepository, productsRepository)
  })

  it('edits shipping cost', async () => {
    ordersRepository.items.push(makeOrder('order-1'))

    const result = await sut.execute({ id: 'order-1', shippingCost: 15 })

    expect(result.isRight()).toBe(true)
    const stored = ordersRepository.items[0]
    expect(stored.shippingCost).toBe(15)
    expect(stored.total).toBe(25)
  })

  it('replaces items re-resolving product snapshots', async () => {
    ordersRepository.items.push(makeOrder('order-1'))
    productsRepository.items.push(makeProduct('product-2'))

    const result = await sut.execute({
      id: 'order-1',
      items: [{ productId: 'product-2', quantity: 2 }],
    })

    expect(result.isRight()).toBe(true)
    const stored = ordersRepository.items[0]
    expect(stored.items).toHaveLength(1)
    expect(stored.items[0].productCode).toBe('PROD002')
    expect(stored.items[0].productName).toBe('Gadget')
    expect(stored.items[0].unitPrice).toBe(20)
    expect(stored.items[0].total).toBe(40)
    expect(stored.total).toBe(40)
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope', shippingCost: 1 })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('returns ResourceNotFoundError when an item product is missing', async () => {
    ordersRepository.items.push(makeOrder('order-1'))

    const result = await sut.execute({
      id: 'order-1',
      items: [{ productId: 'nope', quantity: 1 }],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
