import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { GetOrderByIdUseCase } from '@/domain/sales/application/use-cases/get-order-by-id'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter'

@Controller('/orders/:id')
export class GetOrderByIdController {
  constructor(private getOrderById: GetOrderByIdUseCase) {}

  @Get()
  async handle(@Param('id') id: string) {
    const result = await this.getOrderById.execute({ id })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { order: OrderPresenter.toHTTP(result.value.order) }
  }
}
