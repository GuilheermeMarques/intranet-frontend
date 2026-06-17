import { Body, Controller, Post } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { CreateProductUseCase } from '@/domain/sales/application/use-cases/create-product'
import { ProductPresenter } from '@/infra/http/presenters/product-presenter'
import {
  createProductBodySchema,
  CreateProductBodySchema,
} from './schemas/product-body-schema'

@Controller('/products')
export class CreateProductController {
  constructor(private createProduct: CreateProductUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createProductBodySchema)) body: CreateProductBodySchema,
  ) {
    const result = await this.createProduct.execute(body)
    return { product: ProductPresenter.toHTTP(result.value!.product) }
  }
}
