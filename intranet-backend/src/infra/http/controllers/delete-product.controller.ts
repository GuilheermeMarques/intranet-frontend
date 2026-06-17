import { Controller, Delete, HttpCode, NotFoundException, Param } from '@nestjs/common'
import { DeleteProductUseCase } from '@/domain/sales/application/use-cases/delete-product'

@Controller('/products/:id')
export class DeleteProductController {
  constructor(private deleteProduct: DeleteProductUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') id: string) {
    const result = await this.deleteProduct.execute({ id })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
  }
}
