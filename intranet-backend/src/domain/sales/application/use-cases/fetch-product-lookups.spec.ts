import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Product } from '../../enterprise/entities/product'
import { FetchProductLookupsUseCase } from './fetch-product-lookups'

let productsRepository: InMemoryProductsRepository
let sut: FetchProductLookupsUseCase

function makeProduct(
  override: Partial<{ category: string; supplier: string }>,
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

describe('Fetch Product Lookups', () => {
  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository()
    sut = new FetchProductLookupsUseCase(productsRepository)
  })

  it('returns the distinct sorted categories and suppliers', async () => {
    productsRepository.items.push(
      makeProduct({ category: 'Fruit', supplier: 'Zeta' }, 'p1'),
    )
    productsRepository.items.push(
      makeProduct({ category: 'Veg', supplier: 'Alpha' }, 'p2'),
    )
    productsRepository.items.push(
      makeProduct({ category: 'Fruit', supplier: 'Zeta' }, 'p3'),
    )

    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.categories).toEqual(['Fruit', 'Veg'])
      expect(result.value.suppliers).toEqual(['Alpha', 'Zeta'])
    }
  })
})
