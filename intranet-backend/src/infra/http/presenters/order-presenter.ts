import { Order } from '@/domain/sales/enterprise/entities/order'

export class OrderPresenter {
  static toHTTP(order: Order) {
    return {
      id: order.id.toString(),
      orderCode: order.orderCode,
      clientId: order.clientId ?? null,
      clientCode: order.clientCode,
      clientName: order.clientName,
      clientEmail: order.clientEmail ?? null,
      clientPhone: order.clientPhone ?? null,
      items: order.items.map((item) => ({
        id: item.id.toString(),
        productId: item.productId ?? null,
        productCode: item.productCode ?? null,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
      })),
      shippingCost: order.shippingCost,
      total: order.total,
      status: order.status,
      notes: order.notes ?? null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt ? order.updatedAt.toISOString() : null,
    }
  }
}
