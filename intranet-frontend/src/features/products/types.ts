export interface Product {
  id: string | number;
  code: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  lastSaleAt: string;
  supplier: string;
  category?: string;
  imageUrl?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  code: string;
  name: string;
  supplier: string;
}
