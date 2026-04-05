import {
  Client,
  ClientFilters,
  CreateClientRequest,
  UpdateClientRequest,
} from '../entities/Client';
import { IClientRepository } from '../repositories/IClientRepository';

export class ClientUseCases {
  constructor(private clientRepository: IClientRepository) {}

  async getClients(filters?: ClientFilters): Promise<Client[]> {
    return this.clientRepository.findAll(filters);
  }

  async getClientById(id: string): Promise<Client | null> {
    return this.clientRepository.findById(id);
  }

  async getClientByCode(codigo: string): Promise<Client | null> {
    return this.clientRepository.findByCode(codigo);
  }

  async createClient(clientData: CreateClientRequest): Promise<Client> {
    // Aqui você pode adicionar regras de negócio
    // Por exemplo, validar se o CPF já existe
    const existingClient = await this.clientRepository.findByCode(clientData.cpf);
    if (existingClient) {
      throw new Error('CPF já cadastrado');
    }

    return this.clientRepository.create(clientData);
  }

  async updateClient(id: string, clientData: UpdateClientRequest): Promise<Client> {
    const existingClient = await this.clientRepository.findById(id);
    if (!existingClient) {
      throw new Error('Cliente não encontrado');
    }

    return this.clientRepository.update(id, clientData);
  }

  async deleteClient(id: string): Promise<void> {
    const existingClient = await this.clientRepository.findById(id);
    if (!existingClient) {
      throw new Error('Cliente não encontrado');
    }

    return this.clientRepository.delete(id);
  }

  async getCities(): Promise<string[]> {
    return this.clientRepository.getCities();
  }
}
