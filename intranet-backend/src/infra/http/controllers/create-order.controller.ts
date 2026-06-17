import { Body, Controller, NotFoundException, Post } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { CreateOrderUseCase } from '@/domain/sales/application/use-cases/create-order'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter'
import {
  createOrderBodySchema,
  CreateOrderBodySchema,
} from './schemas/order-body-schema'

@Controller('/orders')
export class CreateOrderController {
  constructor(private createOrder: CreateOrderUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createOrderBodySchema)) body: CreateOrderBodySchema,
  ) {
    const result = await this.createOrder.execute(body)
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { order: OrderPresenter.toHTTP(result.value.order) }
  }
}
