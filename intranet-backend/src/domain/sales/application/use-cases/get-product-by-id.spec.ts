import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Product } from '../../enterprise/entities/product'
import { GetProductByIdUseCase } from './get-product-by-id'

let productsRepository: InMemoryProductsRepository
let sut: GetProductByIdUseCase

function makeProduct(id: string) {
  return Product.create(
    {
      code: 'PROD001',
      name: 'Apple',
      description: 'Desc',
      price: 10,
      stockQuantity: 5,
      supplier: 'Supplier',
    },
    new UniqueEntityID(id),
  )
}

describe('Get Product By Id', () => {
  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository()
    sut = new GetProductByIdUseCase(productsRepository)
  })

  it('returns the product when found', async () => {
    productsRepository.items.push(makeProduct('p1'))

    const result = await sut.execute({ id: 'p1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.product.id.toString()).toBe('p1')
    }
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
