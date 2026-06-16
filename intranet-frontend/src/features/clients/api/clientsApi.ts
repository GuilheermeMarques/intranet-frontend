import clientsMock from '@/mocks/clients.json';
import type { Client, ClientFilters, ClientsData } from '../types';

const clients = clientsMock.clients as Client[];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function deriveCities(list: Client[]): string[] {
  return [...new Set(list.map((c) => c.city))].sort();
}

export const clientsApi = {
  async list(filters?: Partial<ClientFilters>): Promise<ClientsData> {
    await delay(0);
    let result = [...clients];

    if (filters?.code?.trim()) {
      const term = filters.code.toLowerCase();
      result = result.filter((c) => c.code.toLowerCase().includes(term));
    }
    if (filters?.name?.trim()) {
      const term = filters.name.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(term));
    }
    if (filters?.city?.trim()) {
      result = result.filter((c) => c.city === filters.city);
    }

    return { clients: result, cities: deriveCities(clients) };
  },

  async getByCode(code: string): Promise<Client | null> {
    await delay(0);
    return clients.find((c) => c.code === code) ?? null;
  },
};
