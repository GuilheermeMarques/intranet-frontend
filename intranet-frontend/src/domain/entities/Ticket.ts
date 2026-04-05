import type {
  Attachment,
  Message,
  Priority,
  Tag,
  Ticket as BaseTicket,
  TicketStatus,
} from '@/types/ticket';

export interface Ticket extends BaseTicket {}

export type TicketPriority = string;
export type { Attachment, Message, Priority, Tag, TicketStatus };

export interface TicketFilters {
  search?: string;
  priority?: string;
  status?: TicketStatus;
  category?: string;
  assignee?: string;
  reporter?: string;
  dataInicial?: Date | null;
  dataFinal?: Date | null;
}

export interface CreateTicketRequest {
  title: string;
  description: string;
  priority: string;
  category: string;
  tags?: string[];
  assignee?: string;
}

export interface UpdateTicketRequest {
  id: string;
  title?: string;
  description?: string;
  priority?: string;
  status?: TicketStatus;
  category?: string;
  tags?: string[];
  assignee?: string;
}
