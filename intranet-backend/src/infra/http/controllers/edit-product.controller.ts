import { Body, Controller, NotFoundException, Param, Patch } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { EditProductUseCase } from '@/domain/sales/application/use-cases/edit-product'
import { ProductPresenter } from '@/infra/http/presenters/product-presenter'
import {
  editProductBodySchema,
  EditProductBodySchema,
} from './schemas/product-body-schema'

@Controller('/products/:id')
export class EditProductController {
  constructor(private editProduct: EditProductUseCase) {}

  @Patch()
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(editProductBodySchema)) body: EditProductBodySchema,
  ) {
    const result = await this.editProduct.execute({ id, ...body })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { product: ProductPresenter.toHTTP(result.value.product) }
  }
}
