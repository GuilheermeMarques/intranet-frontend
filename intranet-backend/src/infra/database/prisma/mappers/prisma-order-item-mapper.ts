import { OrderItem as PrismaOrderItem, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { OrderItem } from '@/domain/sales/enterprise/entities/order-item'

export class PrismaOrderItemMapper {
  static toDomain(raw: PrismaOrderItem): OrderItem {
    return OrderItem.create(
      {
        productId: raw.productId,
        productCode: raw.productCode,
        productName: raw.productName,
        quantity: raw.quantity,
        unitPrice: raw.unitPrice,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrismaCreate(
    item: OrderItem,
    orderId: string,
  ): Prisma.OrderItemUncheckedCreateInput {
    return {
      id: item.id.toString(),
      orderId,
      productId: item.productId ?? null,
      productCode: item.productCode ?? null,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }
  }
}
