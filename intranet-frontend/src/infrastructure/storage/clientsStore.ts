import { Client, ClientFilters } from '@/domain/entities/Client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ClientsState {
  clients: Client[];
  filters: ClientFilters;
  isLoading: boolean;
  error: string | null;
  selectedClient: Client | null;
}

interface ClientsActions {
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (id: string, client: Client) => void;
  deleteClient: (id: string) => void;
  setFilters: (filters: ClientFilters) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedClient: (client: Client | null) => void;
  reset: () => void;
}

type ClientsStore = ClientsState & ClientsActions;

const initialState: ClientsState = {
  clients: [],
  filters: {},
  isLoading: false,
  error: null,
  selectedClient: null,
};

export const useClientsStore = create<ClientsStore>()(
  persist(
    (set) => ({
      ...initialState,

      setClients: (clients) => set({ clients }),

      addClient: (client) =>
        set((state) => ({
          clients: [...state.clients, client],
        })),

      updateClient: (id, updatedClient) =>
        set((state) => ({
          clients: state.clients.map((client) => (client.id === id ? updatedClient : client)),
        })),

      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        })),

      setFilters: (filters) => set({ filters }),

      clearFilters: () => set({ filters: {} }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setSelectedClient: (selectedClient) => set({ selectedClient }),

      reset: () => set(initialState),
    }),
    {
      name: 'clients-storage',
      partialize: (state) => ({
        clients: state.clients,
        filters: state.filters,
      }),
    },
  ),
);
