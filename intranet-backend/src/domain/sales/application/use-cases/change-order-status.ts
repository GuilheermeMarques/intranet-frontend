import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { OrdersRepository } from '../repositories/orders-repository'
import { Order, OrderStatus } from '../../enterprise/entities/order'

interface ChangeOrderStatusUseCaseRequest {
  id: string
  status: OrderStatus
}
type ChangeOrderStatusUseCaseResponse = Either<
  ResourceNotFoundError,
  { order: Order }
>

@Injectable()
export class ChangeOrderStatusUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    id,
    status,
  }: ChangeOrderStatusUseCaseRequest): Promise<ChangeOrderStatusUseCaseResponse> {
    const order = await this.ordersRepository.findById(id)
    if (!order) return left(new ResourceNotFoundError())

    order.status = status

    await this.ordersRepository.save(order)
    return right({ order })
  }
}
