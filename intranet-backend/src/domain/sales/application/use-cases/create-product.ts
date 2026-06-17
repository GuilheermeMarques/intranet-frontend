import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ProductsRepository } from '../repositories/products-repository'
import { Product } from '../../enterprise/entities/product'

interface CreateProductUseCaseRequest {
  name: string
  description: string
  price: number
  stockQuantity: number
  supplier: string
  category?: string
  imageUrl?: string
}

type CreateProductUseCaseResponse = Either<never, { product: Product }>

@Injectable()
export class CreateProductUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute(
    data: CreateProductUseCaseRequest,
  ): Promise<CreateProductUseCaseResponse> {
    const count = await this.productsRepository.count()
    const code = `PROD${String(count + 1).padStart(3, '0')}`

    const product = Product.create({ ...data, code })
    await this.productsRepository.create(product)

    return right({ product })
  }
}
