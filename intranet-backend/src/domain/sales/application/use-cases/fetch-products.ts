import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import {
  ProductFilters,
  ProductsRepository,
} from '../repositories/products-repository'
import { Product } from '../../enterprise/entities/product'

interface FetchProductsUseCaseRequest {
  filters: ProductFilters
}
type FetchProductsUseCaseResponse = Either<never, { products: Product[] }>

@Injectable()
export class FetchProductsUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute({
    filters,
  }: FetchProductsUseCaseRequest): Promise<FetchProductsUseCaseResponse> {
    const products = await this.productsRepository.findMany(filters)
    return right({ products })
  }
}
