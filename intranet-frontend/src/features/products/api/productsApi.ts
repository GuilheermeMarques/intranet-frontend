import productsMock from '@/mocks/products.json';
import type { Product, ProductFilters } from '../types';

const products = productsMock.products as Product[];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const productsApi = {
  async list(filters?: Partial<ProductFilters>): Promise<Product[]> {
    await delay(0);
    let result = [...products];

    if (filters?.code?.trim()) {
      const term = filters.code.toLowerCase();
      result = result.filter((p) => p.code.toLowerCase().includes(term));
    }
    if (filters?.name?.trim()) {
      const term = filters.name.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }
    if (filters?.supplier?.trim()) {
      const term = filters.supplier.toLowerCase();
      result = result.filter((p) => p.supplier.toLowerCase().includes(term));
    }

    return result;
  },

  async getById(id: string | number): Promise<Product | null> {
    await delay(0);
    return products.find((p) => String(p.id) === String(id)) ?? null;
  },
};
