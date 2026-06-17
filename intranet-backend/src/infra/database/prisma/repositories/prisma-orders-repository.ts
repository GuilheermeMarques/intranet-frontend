import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import {
  OrderFilters,
  OrdersRepository,
} from '@/domain/sales/application/repositories/orders-repository'
import { Order } from '@/domain/sales/enterprise/entities/order'
import { PrismaOrderMapper } from '../mappers/prisma-order-mapper'
import { PrismaOrderItemMapper } from '../mappers/prisma-order-item-mapper'

@Injectable()
export class PrismaOrdersRepository implements OrdersRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(filters: OrderFilters): Promise<Order[]> {
    const where: Prisma.OrderWhereInput = {}
    if (filters.orderCode?.trim())
      where.orderCode = { contains: filters.orderCode, mode: 'insensitive' }
    if (filters.clientName?.trim())
      where.clientName = { contains: filters.clientName, mode: 'insensitive' }
    if (filters.status?.trim()) where.status = filters.status

    const rows = await this.prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })

    return rows.map((row) =>
      PrismaOrderMapper.toDomain(row, row.items.map(PrismaOrderItemMapper.toDomain)),
    )
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })
    if (!row) return null
    return PrismaOrderMapper.toDomain(
      row,
      row.items.map(PrismaOrderItemMapper.toDomain),
    )
  }

  async count(): Promise<number> {
    return this.prisma.order.count()
  }

  async create(order: Order): Promise<void> {
    const data = PrismaOrderMapper.toPrismaOrder(order)
    const orderId = order.id.toString()

    await this.prisma.order.create({
      data: {
        ...data,
        items: {
          create: order.items.map((item) => {
            const { orderId: _orderId, ...itemColumns } =
              PrismaOrderItemMapper.toPrismaCreate(item, orderId)
            return itemColumns
          }),
        },
      },
    })
  }

  async save(order: Order): Promise<void> {
    const data = PrismaOrderMapper.toPrismaOrder(order)
    const orderId = order.id.toString()

    await this.prisma.$transaction([
      this.prisma.order.update({ where: { id: orderId }, data }),
      this.prisma.orderItem.deleteMany({ where: { orderId } }),
      this.prisma.orderItem.createMany({
        data: order.items.map((item) =>
          PrismaOrderItemMapper.toPrismaCreate(item, orderId),
        ),
      }),
    ])
  }
}
