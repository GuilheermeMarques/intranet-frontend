import { Body, Controller, NotFoundException, Param, Patch } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { ChangeOrderStatusUseCase } from '@/domain/sales/application/use-cases/change-order-status'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter'
import {
  statusBodySchema,
  StatusBodySchema,
} from './schemas/order-body-schema'

@Controller('/orders/:id/status')
export class ChangeOrderStatusController {
  constructor(private changeOrderStatus: ChangeOrderStatusUseCase) {}

  @Patch()
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(statusBodySchema)) body: StatusBodySchema,
  ) {
    const result = await this.changeOrderStatus.execute({ id, status: body.status })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { order: OrderPresenter.toHTTP(result.value.order) }
  }
}
