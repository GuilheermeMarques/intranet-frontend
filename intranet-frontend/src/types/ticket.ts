export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'inReview' | 'done';
  priority: string; // Referência ao ID da prioridade
  assignee: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[]; // Array de IDs das tags
  messages: Message[];
}

export interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  mentions: string[];
  type: 'comment' | 'status_update' | 'assignment';
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'other';
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Priority {
  id: string;
  name: string;
  color: string;
  level: number; // 1 = mais baixa, 5 = mais alta
  description?: string;
  isActive: boolean;
  [key: string]: unknown;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  category?: string; // Para agrupar tags por categoria
  [key: string]: unknown;
}
