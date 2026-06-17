import { Controller, Get, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { FetchOrdersUseCase } from '@/domain/sales/application/use-cases/fetch-orders'
import { OrderPresenter } from '@/infra/http/presenters/order-presenter'
import {
  orderQuerySchema,
  OrderQuerySchema,
} from './schemas/order-body-schema'

@Controller('/orders')
export class FetchOrdersController {
  constructor(private fetchOrders: FetchOrdersUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(orderQuerySchema)) query: OrderQuerySchema,
  ) {
    const result = await this.fetchOrders.execute({
      filters: {
        orderCode: query.orderCode,
        clientName: query.clientName,
        status: query.status,
      },
    })

    const { orders } = result.value!

    return { orders: orders.map(OrderPresenter.toHTTP) }
  }
}
