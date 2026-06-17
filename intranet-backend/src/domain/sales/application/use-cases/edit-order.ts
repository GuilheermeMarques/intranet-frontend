import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { OrdersRepository } from '../repositories/orders-repository'
import { ProductsRepository } from '../repositories/products-repository'
import { Order } from '../../enterprise/entities/order'
import { OrderItem } from '../../enterprise/entities/order-item'

interface EditOrderItemInput {
  productId: string
  quantity: number
  unitPrice?: number
}
interface EditOrderUseCaseRequest {
  id: string
  items?: EditOrderItemInput[]
  shippingCost?: number
  notes?: string
}
type EditOrderUseCaseResponse = Either<ResourceNotFoundError, { order: Order }>

@Injectable()
export class EditOrderUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute({
    id,
    items,
    shippingCost,
    notes,
  }: EditOrderUseCaseRequest): Promise<EditOrderUseCaseResponse> {
    const order = await this.ordersRepository.findById(id)
    if (!order) return left(new ResourceNotFoundError())

    if (items) {
      const orderItems: OrderItem[] = []
      for (const item of items) {
        const product = await this.productsRepository.findById(item.productId)
        if (!product) return left(new ResourceNotFoundError())
        orderItems.push(
          OrderItem.create({
            productId: product.id.toString(),
            productCode: product.code,
            productName: product.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice ?? product.price,
          }),
        )
      }
      order.items = orderItems
    }

    if (shippingCost !== undefined) order.shippingCost = shippingCost
    if (notes !== undefined) order.notes = notes

    await this.ordersRepository.save(order)
    return right({ order })
  }
}
