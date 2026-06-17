import { Product } from '@/domain/sales/enterprise/entities/product'

export class ProductPresenter {
  static toHTTP(product: Product) {
    return {
      id: product.id.toString(),
      code: product.code,
      name: product.name,
      description: product.description,
      price: product.price,
      stockQuantity: product.stockQuantity,
      lastSaleAt: product.lastSaleAt ? product.lastSaleAt.toISOString() : null,
      supplier: product.supplier,
      category: product.category ?? null,
      imageUrl: product.imageUrl ?? null,
      active: product.active,
    }
  }
}
