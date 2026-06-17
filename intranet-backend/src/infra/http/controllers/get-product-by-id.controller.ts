import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { GetProductByIdUseCase } from '@/domain/sales/application/use-cases/get-product-by-id'
import { ProductPresenter } from '@/infra/http/presenters/product-presenter'

@Controller('/products/:id')
export class GetProductByIdController {
  constructor(private getProductById: GetProductByIdUseCase) {}

  @Get()
  async handle(@Param('id') id: string) {
    const result = await this.getProductById.execute({ id })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { product: ProductPresenter.toHTTP(result.value.product) }
  }
}
