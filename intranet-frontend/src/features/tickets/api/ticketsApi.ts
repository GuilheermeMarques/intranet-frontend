import ticketsMock from '@/mocks/tickets.json';
import type { Ticket } from '../types';

const tickets = ticketsMock.tickets as unknown as Ticket[];
const statusConfig = ticketsMock.statusConfig;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface TicketsData {
  tickets: Ticket[];
  statusConfig: typeof statusConfig;
}

export const ticketsApi = {
  async list(): Promise<TicketsData> {
    await delay(0);
    return { tickets: [...tickets], statusConfig };
  },
};
