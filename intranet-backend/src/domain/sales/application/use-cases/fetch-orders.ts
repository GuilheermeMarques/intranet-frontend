import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import {
  OrderFilters,
  OrdersRepository,
} from '../repositories/orders-repository'
import { Order } from '../../enterprise/entities/order'

interface FetchOrdersUseCaseRequest {
  filters: OrderFilters
}
type FetchOrdersUseCaseResponse = Either<never, { orders: Order[] }>

@Injectable()
export class FetchOrdersUseCase {
  constructor(private ordersRepository: OrdersRepository) {}

  async execute({
    filters,
  }: FetchOrdersUseCaseRequest): Promise<FetchOrdersUseCaseResponse> {
    const orders = await this.ordersRepository.findMany(filters)
    return right({ orders })
  }
}
