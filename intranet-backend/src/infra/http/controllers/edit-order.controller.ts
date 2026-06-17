import { Body, Controller, NotFoundException, Param, Patch } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { EditOrderUseCase } from '@/domain/sales/application/use-cases/edit-order'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter'
import {
  editOrderBodySchema,
  EditOrderBodySchema,
} from './schemas/order-body-schema'

@Controller('/orders/:id')
export class EditOrderController {
  constructor(private editOrder: EditOrderUseCase) {}

  @Patch()
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(editOrderBodySchema)) body: EditOrderBodySchema,
  ) {
    const result = await this.editOrder.execute({ id, ...body })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { order: OrderPresenter.toHTTP(result.value.order) }
  }
}
