import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Product } from '../../enterprise/entities/product'
import { DeleteProductUseCase } from './delete-product'

let productsRepository: InMemoryProductsRepository
let sut: DeleteProductUseCase

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

describe('Delete Product', () => {
  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository()
    sut = new DeleteProductUseCase(productsRepository)
  })

  it('deletes the product', async () => {
    productsRepository.items.push(makeProduct('p1'))

    const result = await sut.execute({ id: 'p1' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toBeNull()
    expect(productsRepository.items).toHaveLength(0)
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
