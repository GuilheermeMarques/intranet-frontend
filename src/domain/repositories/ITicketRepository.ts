import {
  CreateTicketRequest,
  Ticket,
  TicketFilters,
  UpdateTicketRequest,
} from '../entities/Ticket';

export interface ITicketRepository {
  findAll(filters?: TicketFilters): Promise<Ticket[]>;
  findById(id: string): Promise<Ticket | null>;
  create(ticket: CreateTicketRequest): Promise<Ticket>;
  update(id: string, ticket: UpdateTicketRequest): Promise<Ticket>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: string): Promise<Ticket>;
  assignTicket(id: string, userId: string): Promise<Ticket>;
  getCategories(): Promise<string[]>;
  getPriorities(): Promise<string[]>;
}
