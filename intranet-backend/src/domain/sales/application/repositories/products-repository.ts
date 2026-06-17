import { Product } from '../../enterprise/entities/product'

export interface ProductFilters {
  code?: string
  name?: string
  category?: string
  supplier?: string
}

export abstract class ProductsRepository {
  abstract findMany(filters: ProductFilters): Promise<Product[]>
  abstract findById(id: string): Promise<Product | null>
  abstract findDistinctCategories(): Promise<string[]>
  abstract findDistinctSuppliers(): Promise<string[]>
  abstract count(): Promise<number>
  abstract create(product: Product): Promise<void>
  abstract save(product: Product): Promise<void>
  abstract delete(product: Product): Promise<void>
}
