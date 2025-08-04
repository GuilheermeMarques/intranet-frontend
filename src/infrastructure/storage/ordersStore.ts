import { Order, OrderFilters } from '@/domain/entities/Order';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OrdersState {
  orders: Order[];
  filters: OrderFilters;
  isLoading: boolean;
  error: string | null;
  selectedOrder: Order | null;
}

interface OrdersActions {
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, order: Order) => void;
  deleteOrder: (id: string) => void;
  setFilters: (filters: OrderFilters) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedOrder: (order: Order | null) => void;
  reset: () => void;
}

type OrdersStore = OrdersState & OrdersActions;

const initialState: OrdersState = {
  orders: [],
  filters: {},
  isLoading: false,
  error: null,
  selectedOrder: null,
};

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set) => ({
      ...initialState,

      setOrders: (orders) => set({ orders }),

      addOrder: (order) =>
        set((state) => ({
          orders: [...state.orders, order],
        })),

      updateOrder: (id, updatedOrder) =>
        set((state) => ({
          orders: state.orders.map((order) => (order.id === id ? updatedOrder : order)),
        })),

      deleteOrder: (id) =>
        set((state) => ({
          orders: state.orders.filter((order) => order.id !== id),
        })),

      setFilters: (filters) => set({ filters }),

      clearFilters: () => set({ filters: {} }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setSelectedOrder: (selectedOrder) => set({ selectedOrder }),

      reset: () => set(initialState),
    }),
    {
      name: 'orders-storage',
      partialize: (state) => ({
        orders: state.orders,
        filters: state.filters,
      }),
    },
  ),
);
