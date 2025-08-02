export interface InventoryMovement {
  id: string;
  codigoProduto: string;
  descricao: string;
  quantidade: number;
  tipo: 'entrada' | 'saida';
  data: string;
  motivo?: string;
  responsavel?: string;
  observacoes?: string;
}

export interface InventoryFilters {
  codigoProduto: string;
  descricao: string;
  tipo: string;
  dataInicial: Date | null;
  dataFinal: Date | null;
}
