import {
  Client,
  ClientFilters,
  CreateClientRequest,
  UpdateClientRequest,
} from '../entities/Client';

export interface IClientRepository {
  findAll(filters?: ClientFilters): Promise<Client[]>;
  findById(id: string): Promise<Client | null>;
  findByCode(codigo: string): Promise<Client | null>;
  create(client: CreateClientRequest): Promise<Client>;
  update(id: string, client: UpdateClientRequest): Promise<Client>;
  delete(id: string): Promise<void>;
  getCities(): Promise<string[]>;
}
