import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { OrdersRepository } from '../repositories/orders-repository'
import { ClientsRepository } from '../repositories/clients-repository'
import { ProductsRepository } from '../repositories/products-repository'
import { Order } from '../../enterprise/entities/order'
import { OrderItem } from '../../enterprise/entities/order-item'

interface CreateOrderItemInput {
  productId: string
  quantity: number
  unitPrice?: number
}
interface CreateOrderUseCaseRequest {
  clientId: string
  items: CreateOrderItemInput[]
  shippingCost?: number
  notes?: string
}
type CreateOrderUseCaseResponse = Either<
  ResourceNotFoundError,
  { order: Order }
>

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private clientsRepository: ClientsRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute({
    clientId,
    items,
    shippingCost,
    notes,
  }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    const client = await this.clientsRepository.findById(clientId)
    if (!client) return left(new ResourceNotFoundError())

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

    const count = await this.ordersRepository.count()
    const orderCode = `PED-${String(count + 1).padStart(3, '0')}`

    const order = Order.create({
      orderCode,
      clientId: client.id.toString(),
      clientCode: client.code,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      items: orderItems,
      shippingCost: shippingCost ?? 0,
      notes: notes ?? null,
    })

    await this.ordersRepository.create(order)
    return right({ order })
  }
}
