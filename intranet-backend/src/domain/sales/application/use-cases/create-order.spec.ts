import { InMemoryOrdersRepository } from 'test/repositories/in-memory-orders-repository'
import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository'
import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Client } from '../../enterprise/entities/client'
import { Product } from '../../enterprise/entities/product'
import { CreateOrderUseCase } from './create-order'

let ordersRepository: InMemoryOrdersRepository
let clientsRepository: InMemoryClientsRepository
let productsRepository: InMemoryProductsRepository
let sut: CreateOrderUseCase

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

describe('Create Order', () => {
  beforeEach(() => {
    ordersRepository = new InMemoryOrdersRepository()
    clientsRepository = new InMemoryClientsRepository()
    productsRepository = new InMemoryProductsRepository()
    sut = new CreateOrderUseCase(
      ordersRepository,
      clientsRepository,
      productsRepository,
    )
  })

  it('creates an order with resolved snapshots and computed totals', async () => {
    clientsRepository.items.push(makeClient('client-1'))
    productsRepository.items.push(makeProduct('product-1'))

    const result = await sut.execute({
      clientId: 'client-1',
      items: [{ productId: 'product-1', quantity: 3 }],
      shippingCost: 5,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      const { order } = result.value
      expect(order.orderCode).toBe('PED-001')
      expect(order.clientCode).toBe('CLI001')
      expect(order.clientName).toBe('Acme Corp')
      expect(order.status).toBe('pending')

      const item = order.items[0]
      expect(item.productCode).toBe('PROD001')
      expect(item.productName).toBe('Widget')
      expect(item.unitPrice).toBe(10)
      expect(item.total).toBe(30)

      expect(order.total).toBe(35)
    }
    expect(ordersRepository.items).toHaveLength(1)
  })

  it('returns ResourceNotFoundError when client is missing', async () => {
    productsRepository.items.push(makeProduct('product-1'))

    const result = await sut.execute({
      clientId: 'nope',
      items: [{ productId: 'product-1', quantity: 1 }],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })

  it('returns ResourceNotFoundError when product is missing', async () => {
    clientsRepository.items.push(makeClient('client-1'))

    const result = await sut.execute({
      clientId: 'client-1',
      items: [{ productId: 'nope', quantity: 1 }],
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
