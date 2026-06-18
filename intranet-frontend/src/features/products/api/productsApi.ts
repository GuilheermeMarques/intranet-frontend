import { httpClient, ApiError } from '@/services/httpClient'
import type { Product, ProductFilters } from '../types'

export const productsApi = {
  async list(filters?: Partial<ProductFilters>): Promise<Product[]> {
    const { products } = await httpClient.get<{ products: Product[] }>('/products', filters as Record<string, unknown> | undefined)
    return products
  },
  async getById(id: string | number): Promise<Product | null> {
    try {
      const { product } = await httpClient.get<{ product: Product }>(`/products/${id}`)
      return product
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },
}
