import { CreateOrderRequest, OrderFilters, UpdateOrderRequest } from '@/domain/entities/Order';
import { ordersApi } from '@/infrastructure/services/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query Keys
export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

// Hooks de Query
export const useOrdersQuery = (filters?: OrderFilters) => {
  return useQuery({
    queryKey: orderKeys.list(filters || {}),
    queryFn: () => ordersApi.getOrders(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useOrderQuery = (id: string) => {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getOrderById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Hooks de Mutation
export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderData: CreateOrderRequest) => ordersApi.createOrder(orderData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

export const useUpdateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, orderData }: { id: string; orderData: UpdateOrderRequest }) =>
      ordersApi.updateOrder(id, orderData),
    onSuccess: (updatedOrder) => {
      queryClient.setQueryData(orderKeys.detail(updatedOrder.id), updatedOrder);
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

export const useDeleteOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersApi.deleteOrder(id),
    onSuccess: (_, deletedId) => {
      queryClient.removeQueries({ queryKey: orderKeys.detail(deletedId) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
};

// Hook combinado para operações CRUD
export const useOrdersCRUD = () => {
  const createMutation = useCreateOrderMutation();
  const updateMutation = useUpdateOrderMutation();
  const deleteMutation = useDeleteOrderMutation();

  return {
    createOrder: createMutation.mutateAsync,
    updateOrder: updateMutation.mutateAsync,
    deleteOrder: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
};
