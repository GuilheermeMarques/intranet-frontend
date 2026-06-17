import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { ProductsRepository } from '../repositories/products-repository'
import { Product } from '../../enterprise/entities/product'

interface EditProductUseCaseRequest {
  id: string
  name?: string
  description?: string
  price?: number
  stockQuantity?: number
  supplier?: string
  category?: string
  imageUrl?: string
  active?: boolean
}

type EditProductUseCaseResponse = Either<
  ResourceNotFoundError,
  { product: Product }
>

@Injectable()
export class EditProductUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    id,
    ...data
  }: EditProductUseCaseRequest): Promise<EditProductUseCaseResponse> {
    const product = await this.productsRepository.findById(id)
    if (!product) return left(new ResourceNotFoundError())

    if (data.name !== undefined) product.name = data.name
    if (data.description !== undefined) product.description = data.description
    if (data.price !== undefined) product.price = data.price
    if (data.stockQuantity !== undefined)
      product.stockQuantity = data.stockQuantity
    if (data.supplier !== undefined) product.supplier = data.supplier
    if (data.category !== undefined) product.category = data.category
    if (data.imageUrl !== undefined) product.imageUrl = data.imageUrl
    if (data.active !== undefined) product.active = data.active

    await this.productsRepository.save(product)
    return right({ product })
  }
}
