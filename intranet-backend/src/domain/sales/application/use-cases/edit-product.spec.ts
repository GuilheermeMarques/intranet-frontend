import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Product } from '../../enterprise/entities/product'
import { EditProductUseCase } from './edit-product'

let productsRepository: InMemoryProductsRepository
let sut: EditProductUseCase

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

describe('Edit Product', () => {
  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository()
    sut = new EditProductUseCase(productsRepository)
  })

  it('patches only the provided fields', async () => {
    productsRepository.items.push(makeProduct('p1'))

    const result = await sut.execute({
      id: 'p1',
      name: 'Banana',
      price: 20,
      active: false,
    })

    expect(result.isRight()).toBe(true)
    const stored = productsRepository.items[0]
    expect(stored.name).toBe('Banana')
    expect(stored.price).toBe(20)
    expect(stored.active).toBe(false)
    expect(stored.description).toBe('Desc')
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope', name: 'X' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
