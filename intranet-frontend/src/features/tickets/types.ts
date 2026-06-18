export type TicketStatus = 'todo' | 'inProgress' | 'inReview' | 'done';
export type TicketMessageType = 'comment' | 'status_update' | 'assignment';
export type AttachmentType = 'image' | 'document' | 'other';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  mentions: string[];
  type: TicketMessageType;
  attachments?: Attachment[];
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: string;
  assignee: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  messages: Message[];
  attachments?: Attachment[];
}

export interface Priority {
  id: string;
  name: string;
  color: string;
  level: number;
  description?: string;
  isActive: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  category?: string;
}
