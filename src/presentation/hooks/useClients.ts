import { Client, ClientFilters } from '@/domain/entities/Client';
import { useClientsStore } from '@/infrastructure/storage/clientsStore';
import { useCallback, useMemo } from 'react';

export const useClients = () => {
  const {
    clients,
    filters,
    isLoading,
    error,
    selectedClient,
    setClients,
    addClient,
    updateClient,
    deleteClient,
    setFilters,
    clearFilters,
    setLoading,
    setError,
    setSelectedClient,
  } = useClientsStore();

  const filteredClients = useMemo(() => {
    return clients.filter((client) => {
      const codigoMatch =
        !filters.codigo ||
        filters.codigo.trim() === '' ||
        client.codigo.toLowerCase().includes(filters.codigo.toLowerCase());

      const nomeMatch =
        !filters.nome ||
        filters.nome.trim() === '' ||
        client.nome.toLowerCase().includes(filters.nome.toLowerCase());

      const cidadeMatch =
        !filters.cidade || filters.cidade.trim() === '' || client.cidade === filters.cidade;

      let dataMatch = true;
      if (filters.dataInicial || filters.dataFinal) {
        const dataUltimaCompra = new Date(client.dataUltimaCompra);

        if (filters.dataInicial && filters.dataFinal) {
          dataMatch =
            dataUltimaCompra >= filters.dataInicial && dataUltimaCompra <= filters.dataFinal;
        } else if (filters.dataInicial) {
          dataMatch = dataUltimaCompra >= filters.dataInicial;
        } else if (filters.dataFinal) {
          dataMatch = dataUltimaCompra <= filters.dataFinal;
        }
      }

      return codigoMatch && nomeMatch && cidadeMatch && dataMatch;
    });
  }, [clients, filters]);

  const handleFilterChange = useCallback(
    (newFilters: Partial<ClientFilters>) => {
      setFilters({ ...filters, ...newFilters });
    },
    [filters, setFilters],
  );

  const handleClearFilters = useCallback(() => {
    clearFilters();
  }, [clearFilters]);

  const handleSelectClient = useCallback(
    (client: Client) => {
      setSelectedClient(client);
    },
    [setSelectedClient],
  );

  const handleCreateClient = useCallback(
    async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        setLoading(true);
        setError(null);

        // Simular criação de cliente (substituir por chamada real da API)
        const newClient: Client = {
          ...clientData,
          id: Date.now().toString(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        addClient(newClient);
        return newClient;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao criar cliente');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [addClient, setLoading, setError],
  );

  const handleUpdateClient = useCallback(
    async (id: string, clientData: Partial<Client>) => {
      try {
        setLoading(true);
        setError(null);

        const existingClient = clients.find((c) => c.id === id);
        if (!existingClient) {
          throw new Error('Cliente não encontrado');
        }

        const updatedClient: Client = {
          ...existingClient,
          ...clientData,
          updatedAt: new Date(),
        };

        updateClient(id, updatedClient);
        return updatedClient;
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao atualizar cliente');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [clients, updateClient, setLoading, setError],
  );

  const handleDeleteClient = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        deleteClient(id);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao deletar cliente');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [deleteClient, setLoading, setError],
  );

  return {
    clients: filteredClients,
    filters,
    isLoading,
    error,
    selectedClient,
    handleFilterChange,
    handleClearFilters,
    handleSelectClient,
    handleCreateClient,
    handleUpdateClient,
    handleDeleteClient,
    setClients,
  };
};
