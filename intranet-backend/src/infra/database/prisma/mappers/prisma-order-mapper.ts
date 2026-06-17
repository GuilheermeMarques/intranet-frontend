import { Order as PrismaOrder, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Order, OrderStatus } from '@/domain/sales/enterprise/entities/order'
import { OrderItem } from '@/domain/sales/enterprise/entities/order-item'

export class PrismaOrderMapper {
  static toDomain(raw: PrismaOrder, items: OrderItem[]): Order {
    return Order.create(
      {
        orderCode: raw.orderCode,
        clientId: raw.clientId,
        clientCode: raw.clientCode,
        clientName: raw.clientName,
        clientEmail: raw.clientEmail,
        clientPhone: raw.clientPhone,
        items,
        shippingCost: raw.shippingCost,
        status: raw.status as OrderStatus,
        notes: raw.notes,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrismaOrder(order: Order): Prisma.OrderUncheckedCreateInput {
    return {
      id: order.id.toString(),
      orderCode: order.orderCode,
      clientId: order.clientId ?? null,
      clientCode: order.clientCode,
      clientName: order.clientName,
      clientEmail: order.clientEmail ?? null,
      clientPhone: order.clientPhone ?? null,
      shippingCost: order.shippingCost,
      status: order.status,
      notes: order.notes ?? null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt ?? null,
    }
  }
}
