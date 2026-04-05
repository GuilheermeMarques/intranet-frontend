import { ClientFilters, CreateClientRequest, UpdateClientRequest } from '@/domain/entities/Client';
import { clientsApi } from '@/infrastructure/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: ClientFilters) => [...clientKeys.lists(), filters] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
  cities: () => [...clientKeys.all, 'cities'] as const,
};

// Hooks de Query
export const useClientsQuery = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: clientKeys.list(filters || {}),
    queryFn: () => clientsApi.getClients(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useClientQuery = (id: string) => {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientsApi.getClientById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useClientCitiesQuery = () => {
  return useQuery({
    queryKey: clientKeys.cities(),
    queryFn: () => clientsApi.getCities(),
    staleTime: 10 * 60 * 1000, // 10 minutos
    gcTime: 30 * 60 * 1000, // 30 minutos
  });
};

// Hooks de Mutation
export const useCreateClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clientData: CreateClientRequest) => clientsApi.createClient(clientData),
    onSuccess: () => {
      // Invalidate e refetch queries relacionadas
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientKeys.cities() });
    },
  });
};

export const useUpdateClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, clientData }: { id: string; clientData: UpdateClientRequest }) =>
      clientsApi.updateClient(id, clientData),
    onSuccess: (updatedClient) => {
      // Atualizar cache diretamente
      queryClient.setQueryData(clientKeys.detail(updatedClient.id), updatedClient);

      // Invalidate queries de lista
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
};

export const useDeleteClientMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.deleteClient(id),
    onSuccess: (_, deletedId) => {
      // Remover do cache
      queryClient.removeQueries({ queryKey: clientKeys.detail(deletedId) });

      // Invalidate queries de lista
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() });
    },
  });
};

// Hook combinado para operações CRUD
export const useClientsCRUD = () => {
  const createMutation = useCreateClientMutation();
  const updateMutation = useUpdateClientMutation();
  const deleteMutation = useDeleteClientMutation();

  return {
    createClient: createMutation.mutateAsync,
    updateClient: updateMutation.mutateAsync,
    deleteClient: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
};
