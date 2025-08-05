export interface Client {
  id: string;
  codigo: string;
  nome: string;
  cpf: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
  bairro: string;
  numero: string;
  complemento: string;
  email: string;
  telefone: string;
  instagram: string;
  dataUltimaCompra: Date;
  quantidadeCompras: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientFilters {
  codigo?: string;
  nome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  instagram?: string;
  cidade?: string;
  estado?: string;
  dataInicial?: Date;
  dataFinal?: Date;
}

export interface CreateClientRequest {
  nome: string;
  cpf: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
  bairro: string;
  numero: string;
  complemento?: string;
  email: string;
  telefone: string;
  instagram?: string;
}

export interface UpdateClientRequest extends Partial<CreateClientRequest> {
  id: string;
}
