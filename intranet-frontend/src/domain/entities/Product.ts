import type { Product as BaseProduct } from '@/types/product';

export interface Product extends BaseProduct {}

export interface ProductFilters {
  codigoProduto?: string;
  nomeProduto?: string;
  categoria?: string;
  fornecedor?: string;
  ativo?: boolean;
  estoqueMinimo?: number;
}

export interface CreateProductRequest {
  codigoProduto: string;
  nomeProduto: string;
  descricaoProduto: string;
  preco: number;
  quantidadeEstoque: number;
  fornecedor: string;
  categoria?: string;
  imagem?: string;
  ativo?: boolean;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string | number;
}
