import {
  ProductFilters,
  ProductsRepository,
} from '@/domain/sales/application/repositories/products-repository'
import { Product } from '@/domain/sales/enterprise/entities/product'

export class InMemoryProductsRepository implements ProductsRepository {
  public items: Product[] = []

  async findMany(filters: ProductFilters): Promise<Product[]> {
    return this.items.filter((product) => {
      if (
        filters.code?.trim() &&
        !product.code.toLowerCase().includes(filters.code.toLowerCase())
      )
        return false
      if (
        filters.name?.trim() &&
        !product.name.toLowerCase().includes(filters.name.toLowerCase())
      )
        return false
      if (filters.category?.trim() && product.category !== filters.category)
        return false
      if (
        filters.supplier?.trim() &&
        !product.supplier.toLowerCase().includes(filters.supplier.toLowerCase())
      )
        return false
      return true
    })
  }

  async findById(id: string) {
    return this.items.find((p) => p.id.toString() === id) ?? null
  }

  async findDistinctCategories() {
    return [
      ...new Set(
        this.items
          .map((p) => p.category)
          .filter((c): c is string => c != null),
      ),
    ].sort()
  }

  async findDistinctSuppliers() {
    return [...new Set(this.items.map((p) => p.supplier))].sort()
  }

  async count() {
    return this.items.length
  }

  async create(product: Product) {
    this.items.push(product)
  }

  async save(product: Product) {
    const index = this.items.findIndex((p) => p.id.equals(product.id))
    if (index >= 0) this.items[index] = product
  }

  async delete(product: Product) {
    this.items = this.items.filter((p) => !p.id.equals(product.id))
  }
}
