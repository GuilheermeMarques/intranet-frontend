export interface Product {
  id: string | number;
  codigoProduto: string;
  nomeProduto: string;
  descricaoProduto: string;
  preco: number;
  quantidadeEstoque: number;
  ultimaDataVenda: string;
  fornecedor: string;
  categoria?: string;
  imagem?: string;
  ativo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
