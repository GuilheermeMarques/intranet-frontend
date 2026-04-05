export interface Client {
  id?: string;
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
  dataUltimaCompra: string | null;
  quantidadeCompras: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientFilters {
  codigo: string;
  nome: string;
  cidade: string;
  dataInicial: Date | null;
  dataFinal: Date | null;
}

export interface ClientsData {
  clients: Client[];
  cidades: string[];
}
