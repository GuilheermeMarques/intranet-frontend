import { Ticket, TicketFilters } from '@/domain/entities/Ticket';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TicketsState {
  tickets: Ticket[];
  filters: TicketFilters;
  isLoading: boolean;
  error: string | null;
  selectedTicket: Ticket | null;
  categories: string[];
  priorities: string[];
}

interface TicketsActions {
  setTickets: (tickets: Ticket[]) => void;
  addTicket: (ticket: Ticket) => void;
  updateTicket: (id: string, ticket: Ticket) => void;
  deleteTicket: (id: string) => void;
  setFilters: (filters: TicketFilters) => void;
  clearFilters: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedTicket: (ticket: Ticket | null) => void;
  setCategories: (categories: string[]) => void;
  setPriorities: (priorities: string[]) => void;
  reset: () => void;
}

type TicketsStore = TicketsState & TicketsActions;

const initialState: TicketsState = {
  tickets: [],
  filters: {},
  isLoading: false,
  error: null,
  selectedTicket: null,
  categories: [],
  priorities: [],
};

export const useTicketsStore = create<TicketsStore>()(
  persist(
    (set) => ({
      ...initialState,

      setTickets: (tickets) => set({ tickets }),

      addTicket: (ticket) =>
        set((state) => ({
          tickets: [...state.tickets, ticket],
        })),

      updateTicket: (id, updatedTicket) =>
        set((state) => ({
          tickets: state.tickets.map((ticket) => (ticket.id === id ? updatedTicket : ticket)),
        })),

      deleteTicket: (id) =>
        set((state) => ({
          tickets: state.tickets.filter((ticket) => ticket.id !== id),
        })),

      setFilters: (filters) => set({ filters }),

      clearFilters: () => set({ filters: {} }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      setSelectedTicket: (selectedTicket) => set({ selectedTicket }),

      setCategories: (categories) => set({ categories }),

      setPriorities: (priorities) => set({ priorities }),

      reset: () => set(initialState),
    }),
    {
      name: 'tickets-storage',
      partialize: (state) => ({
        tickets: state.tickets,
        filters: state.filters,
        categories: state.categories,
        priorities: state.priorities,
      }),
    },
  ),
);
