import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ProductsRepository } from '../repositories/products-repository'

type FetchProductLookupsUseCaseResponse = Either<
  never,
  { categories: string[]; suppliers: string[] }
>

@Injectable()
export class FetchProductLookupsUseCase {
  constructor(private productsRepository: ProductsRepository) {}

  async execute(): Promise<FetchProductLookupsUseCaseResponse> {
    const categories = await this.productsRepository.findDistinctCategories()
    const suppliers = await this.productsRepository.findDistinctSuppliers()
    return right({ categories, suppliers })
  }
}
