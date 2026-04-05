import type { Client as BaseClient } from '@/types/client';

export interface Client extends Omit<BaseClient, 'id' | 'createdAt' | 'updatedAt'> {
  id: string;
  createdAt: string;
  updatedAt: string;
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
  dataInicial?: Date | null;
  dataFinal?: Date | null;
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
