import { InMemoryProductsRepository } from 'test/repositories/in-memory-products-repository'
import { CreateProductUseCase } from './create-product'

let productsRepository: InMemoryProductsRepository
let sut: CreateProductUseCase

const input = {
  name: 'Apple',
  description: 'Fresh apple',
  price: 10,
  stockQuantity: 5,
  supplier: 'Supplier',
}

describe('Create Product', () => {
  beforeEach(() => {
    productsRepository = new InMemoryProductsRepository()
    sut = new CreateProductUseCase(productsRepository)
  })

  it('creates a product with auto-generated code and defaults', async () => {
    const result = await sut.execute(input)

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.product.code).toBe('PROD001')
      expect(result.value.product.active).toBe(true)
      expect(result.value.product.lastSaleAt).toBeNull()
    }
    expect(productsRepository.items).toHaveLength(1)
  })

  it('increments the code based on the existing count', async () => {
    await sut.execute(input)
    const result = await sut.execute({ ...input, name: 'Banana' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.product.code).toBe('PROD002')
    }
  })
})
