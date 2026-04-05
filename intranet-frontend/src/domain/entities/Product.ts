export interface Product {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoria: string;
  fornecedor: string;
  imagem?: string;
  ativo: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductFilters {
  codigo?: string;
  nome?: string;
  categoria?: string;
  fornecedor?: string;
  ativo?: boolean;
  estoqueMinimo?: number;
}

export interface CreateProductRequest {
  codigo: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  categoria: string;
  fornecedor: string;
  imagem?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}
