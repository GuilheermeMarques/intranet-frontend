import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { OrdersRepository } from '../repositories/orders-repository'
import { Order } from '../../enterprise/entities/order'

interface GetOrderByIdUseCaseRequest {
  id: string
}
type GetOrderByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  { order: Order }
>

@Injectable()
export class GetOrderByIdUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    id,
  }: GetOrderByIdUseCaseRequest): Promise<GetOrderByIdUseCaseResponse> {
    const order = await this.ordersRepository.findById(id)
    if (!order) return left(new ResourceNotFoundError())
    return right({ order })
  }
}
