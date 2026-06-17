import { Product as PrismaProductModel, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Product } from '@/domain/sales/enterprise/entities/product'

export class PrismaProductMapper {
  static toDomain(raw: PrismaProductModel): Product {
    return Product.create(
      {
        code: raw.code,
        name: raw.name,
        description: raw.description,
        price: raw.price,
        stockQuantity: raw.stockQuantity,
        lastSaleAt: raw.lastSaleAt,
        supplier: raw.supplier,
        category: raw.category,
        imageUrl: raw.imageUrl,
        active: raw.active,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(product: Product): Prisma.ProductUncheckedCreateInput {
    return {
      id: product.id.toString(),
      code: product.code,
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      lastSaleAt: product.lastSaleAt ?? null,
      supplier: product.supplier,
      category: product.category ?? null,
      imageUrl: product.imageUrl ?? null,
      active: product.active,
    }
  }
}
