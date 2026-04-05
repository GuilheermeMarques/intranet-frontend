export interface Ticket {
  id: string;
  titulo: string;
  descricao: string;
  prioridade: TicketPriority;
  status: TicketStatus;
  categoria: string;
  tags: string[];
  criadoPor: string;
  atribuidoPara?: string;
  createdAt: Date;
  updatedAt: Date;
  fechadoEm?: Date;
}

export type TicketPriority = 'baixa' | 'media' | 'alta' | 'critica';
export type TicketStatus = 'aberto' | 'em_andamento' | 'resolvido' | 'fechado';

export interface TicketFilters {
  titulo?: string;
  prioridade?: TicketPriority;
  status?: TicketStatus;
  categoria?: string;
  criadoPor?: string;
  atribuidoPara?: string;
  dataInicial?: Date;
  dataFinal?: Date;
}

export interface CreateTicketRequest {
  titulo: string;
  descricao: string;
  prioridade: TicketPriority;
  categoria: string;
  tags?: string[];
  atribuidoPara?: string;
}

export interface UpdateTicketRequest {
  id: string;
  titulo?: string;
  descricao?: string;
  prioridade?: TicketPriority;
  status?: TicketStatus;
  categoria?: string;
  tags?: string[];
  atribuidoPara?: string;
}
