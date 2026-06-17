import { Controller, Get, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { FetchProductsUseCase } from '@/domain/sales/application/use-cases/fetch-products'
import { ProductPresenter } from '@/infra/http/presenters/product-presenter'
import {
  productQuerySchema,
  ProductQuerySchema,
} from './schemas/product-body-schema'

@Controller('/products')
export class FetchProductsController {
  constructor(private fetchProducts: FetchProductsUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(productQuerySchema)) query: ProductQuerySchema,
  ) {
    const result = await this.fetchProducts.execute({
      filters: {
        code: query.code,
        name: query.name,
        category: query.category,
        supplier: query.supplier,
      },
    })

    const { products } = result.value!

    return { products: products.map(ProductPresenter.toHTTP) }
  }
}
