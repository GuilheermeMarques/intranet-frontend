import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { ProductsRepository } from '../repositories/products-repository'
import { Product } from '../../enterprise/entities/product'

interface GetProductByIdUseCaseRequest {
  id: string
}
type GetProductByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  { product: Product }
>

@Injectable()
export class GetProductByIdUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    id,
  }: GetProductByIdUseCaseRequest): Promise<GetProductByIdUseCaseResponse> {
    const product = await this.productsRepository.findById(id)
    if (!product) return left(new ResourceNotFoundError())
    return right({ product })
  }
}
