import {
  CreateProductRequest,
  Product,
  ProductFilters,
  UpdateProductRequest,
} from '../entities/Product';

export interface IProductRepository {
  findAll(filters?: ProductFilters): Promise<Product[]>;
  findById(id: string): Promise<Product | null>;
  findByCode(codigo: string): Promise<Product | null>;
  create(product: CreateProductRequest): Promise<Product>;
  update(id: string, product: UpdateProductRequest): Promise<Product>;
  delete(id: string): Promise<void>;
  updateStock(id: string, quantity: number): Promise<Product>;
  getCategories(): Promise<string[]>;
  getSuppliers(): Promise<string[]>;
}
