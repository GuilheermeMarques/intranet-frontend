import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Product } from '../../enterprise/entities/product'
import { FetchProductsUseCase } from './fetch-products'

let productsRepository: InMemoryProductsRepository
let sut: FetchProductsUseCase

function makeProduct(
  override: Partial<{ name: string; category: string; supplier: string }>,
  id: string,
) {
  return Product.create(
    {
      code: id,
      name: 'Default',
      description: 'Desc',
      price: 10,
      stockQuantity: 5,
      supplier: 'Supplier',
      ...override,
    },
    new UniqueEntityID(id),
  )
}

describe('Fetch Products', () => {
  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository()
    sut = new FetchProductsUseCase(productsRepository)
  })

  it('filters products by partial name', async () => {
    productsRepository.items.push(makeProduct({ name: 'Apple' }, 'p1'))
    productsRepository.items.push(makeProduct({ name: 'Banana' }, 'p2'))
    productsRepository.items.push(makeProduct({ name: 'Applesauce' }, 'p3'))

    const result = await sut.execute({ filters: { name: 'apple' } })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.products).toHaveLength(2)
      expect(result.value.products.map((p) => p.name).sort()).toEqual([
        'Apple',
        'Applesauce',
      ])
    }
  })
})
