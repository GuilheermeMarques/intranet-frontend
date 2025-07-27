'use client';

import { DashboardLayout } from '@/components/DashboardLayout';
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Add as AddIcon,
  AttachFile as AttachFileIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Description as DescriptionIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  FilterList as FilterIcon,
  Image as ImageIcon,
  Search as SearchIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';

// Tipos para os chamados
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'inReview' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  messages: Message[];
}

// Tipos para as mensagens do chat
interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  mentions: string[];
  type: 'comment' | 'status_update' | 'assignment';
  attachments?: Attachment[];
}

// Tipos para anexos
interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'other';
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

// Dados mockados para demonstração
const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Erro no login do sistema',
    description:
      'Usuários não conseguem fazer login com credenciais válidas. O erro aparece após inserir email e senha.',
    status: 'todo',
    priority: 'high',
    assignee: 'João Silva',
    reporter: 'Maria Santos',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:20:00Z',
    category: 'Sistema',
    tags: ['login', 'bug', 'urgente'],
    messages: [
      {
        id: '1',
        author: 'Maria Santos',
        content:
          'Usuários estão relatando que não conseguem fazer login mesmo com credenciais corretas. O erro aparece após inserir email e senha.',
        timestamp: '2024-01-15T10:30:00Z',
        mentions: [],
        type: 'comment',
      },
      {
        id: '2',
        author: 'João Silva',
        content:
          'Vou investigar o problema. @Maria Santos, você pode me enviar os logs de erro que aparecem?',
        timestamp: '2024-01-15T11:15:00Z',
        mentions: ['Maria Santos'],
        type: 'comment',
        attachments: [
          {
            id: '1',
            name: 'error-screenshot.png',
            url: '/api/attachments/error-screenshot.png',
            type: 'image',
            size: 245760,
            uploadedBy: 'João Silva',
            uploadedAt: '2024-01-15T11:15:00Z',
          },
        ],
      },
      {
        id: '3',
        author: 'Maria Santos',
        content:
          'Claro! Enviei os logs por email. O erro parece estar relacionado ao token de autenticação.',
        timestamp: '2024-01-15T11:45:00Z',
        mentions: [],
        type: 'comment',
        attachments: [
          {
            id: '2',
            name: 'auth-logs.txt',
            url: '/api/attachments/auth-logs.txt',
            type: 'document',
            size: 15360,
            uploadedBy: 'Maria Santos',
            uploadedAt: '2024-01-15T11:45:00Z',
          },
          {
            id: '3',
            name: 'login-error.png',
            url: '/api/attachments/login-error.png',
            type: 'image',
            size: 189440,
            uploadedBy: 'Maria Santos',
            uploadedAt: '2024-01-15T11:45:00Z',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Melhoria na interface do catálogo',
    description:
      'Adicionar filtros avançados e melhorar a responsividade da página do catálogo de produtos.',
    status: 'inProgress',
    priority: 'medium',
    assignee: 'Ana Costa',
    reporter: 'Pedro Oliveira',
    createdAt: '2024-01-14T09:15:00Z',
    updatedAt: '2024-01-15T16:45:00Z',
    category: 'Interface',
    tags: ['UI/UX', 'melhoria', 'catálogo'],
    messages: [
      {
        id: '1',
        author: 'Pedro Oliveira',
        content: 'Precisamos adicionar filtros por preço, categoria e disponibilidade no catálogo.',
        timestamp: '2024-01-14T09:15:00Z',
        mentions: [],
        type: 'comment',
      },
      {
        id: '2',
        author: 'Ana Costa',
        content:
          'Entendi! Vou começar implementando os filtros básicos. @Pedro Oliveira, você tem alguma preferência específica para o layout?',
        timestamp: '2024-01-15T10:00:00Z',
        mentions: ['Pedro Oliveira'],
        type: 'comment',
        attachments: [
          {
            id: '4',
            name: 'catalog-mockup.png',
            url: '/api/attachments/catalog-mockup.png',
            type: 'image',
            size: 312320,
            uploadedBy: 'Ana Costa',
            uploadedAt: '2024-01-15T10:00:00Z',
          },
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'Relatório de vendas não carrega',
    description:
      'A página de relatórios de vendas apresenta erro 500 e não carrega os dados dos últimos 30 dias.',
    status: 'inReview',
    priority: 'critical',
    assignee: 'Carlos Lima',
    reporter: 'Fernanda Rocha',
    createdAt: '2024-01-13T11:00:00Z',
    updatedAt: '2024-01-15T12:30:00Z',
    category: 'Relatórios',
    tags: ['relatório', 'crítico', 'vendas'],
    messages: [
      {
        id: '1',
        author: 'Fernanda Rocha',
        content:
          'O relatório de vendas está apresentando erro 500. É urgente pois precisamos dos dados para a reunião de hoje.',
        timestamp: '2024-01-13T11:00:00Z',
        mentions: [],
        type: 'comment',
      },
      {
        id: '2',
        author: 'Carlos Lima',
        content:
          'Vou verificar imediatamente. @Fernanda Rocha, você pode me enviar o erro específico que aparece?',
        timestamp: '2024-01-13T11:30:00Z',
        mentions: ['Fernanda Rocha'],
        type: 'comment',
      },
      {
        id: '3',
        author: 'Carlos Lima',
        content:
          'Problema identificado! Era um timeout na consulta. Corrigido e testado. @Fernanda Rocha pode testar agora.',
        timestamp: '2024-01-15T12:30:00Z',
        mentions: ['Fernanda Rocha'],
        type: 'status_update',
        attachments: [
          {
            id: '5',
            name: 'sales-report-fixed.png',
            url: '/api/attachments/sales-report-fixed.png',
            type: 'image',
            size: 156720,
            uploadedBy: 'Carlos Lima',
            uploadedAt: '2024-01-15T12:30:00Z',
          },
        ],
      },
    ],
  },
  {
    id: '4',
    title: 'Atualização de dados pessoais',
    description:
      'Implementar funcionalidade para usuários atualizarem seus dados pessoais no perfil.',
    status: 'done',
    priority: 'low',
    assignee: 'Roberto Alves',
    reporter: 'Lucia Ferreira',
    createdAt: '2024-01-10T08:45:00Z',
    updatedAt: '2024-01-14T17:20:00Z',
    category: 'Perfil',
    tags: ['perfil', 'dados', 'concluído'],
    messages: [
      {
        id: '1',
        author: 'Lucia Ferreira',
        content: 'Precisamos permitir que os usuários atualizem nome, email e telefone no perfil.',
        timestamp: '2024-01-10T08:45:00Z',
        mentions: [],
        type: 'comment',
      },
      {
        id: '2',
        author: 'Roberto Alves',
        content:
          'Implementado! @Lucia Ferreira pode testar a funcionalidade. Adicionei validação de email também.',
        timestamp: '2024-01-14T17:20:00Z',
        mentions: ['Lucia Ferreira'],
        type: 'status_update',
      },
    ],
  },
  {
    id: '5',
    title: 'Integração com API externa',
    description:
      'Desenvolver integração com API de terceiros para sincronização de dados de produtos.',
    status: 'todo',
    priority: 'high',
    assignee: 'Mariana Santos',
    reporter: 'Ricardo Costa',
    createdAt: '2024-01-12T14:20:00Z',
    updatedAt: '2024-01-15T10:15:00Z',
    category: 'Integração',
    tags: ['API', 'integração', 'produtos'],
    messages: [
      {
        id: '1',
        author: 'Ricardo Costa',
        content:
          'Precisamos integrar com a API do fornecedor para sincronizar produtos automaticamente.',
        timestamp: '2024-01-12T14:20:00Z',
        mentions: [],
        type: 'comment',
      },
    ],
  },
];

const statusConfig = {
  todo: { label: 'ToDo', color: '#ff9800' },
  inProgress: { label: 'InProgress', color: '#2196f3' },
  inReview: { label: 'In Review', color: '#9c27b0' },
  done: { label: 'Done', color: '#4caf50' },
};

const priorityConfig = {
  low: { label: 'Baixa', color: '#4caf50' },
  medium: { label: 'Média', color: '#ff9800' },
  high: { label: 'Alta', color: '#f44336' },
  critical: { label: 'Crítica', color: '#d32f2f' },
};

// Componente Sortable para os tickets
const SortableTicketCard = ({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: ticket.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      sx={{
        mb: 2,
        cursor: 'grab',
        '&:hover': { boxShadow: 3 },
        '&:active': { cursor: 'grabbing' },
        transition: 'all 0.2s ease',
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 1,
          }}
        >
          <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1, mr: 1 }}>
            {ticket.title}
          </Typography>
          <Chip
            label={priorityConfig[ticket.priority].label}
            size="small"
            sx={{
              backgroundColor: priorityConfig[ticket.priority].color,
              color: 'white',
              fontSize: '0.7rem',
            }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.4 }}>
          {ticket.description.length > 80
            ? `${ticket.description.substring(0, 80)}...`
            : ticket.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>
            {ticket.assignee.charAt(0)}
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            {ticket.assignee}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip
            label={ticket.category}
            size="small"
            variant="outlined"
            sx={{ fontSize: '0.7rem' }}
          />
          <Typography variant="caption" color="text.secondary">
            {formatDate(ticket.updatedAt)}
          </Typography>
        </Box>

        {ticket.tags.length > 0 && (
          <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {ticket.tags.slice(0, 2).map((tag, index) => (
              <Chip key={index} label={tag} size="small" sx={{ fontSize: '0.6rem', height: 20 }} />
            ))}
            {ticket.tags.length > 2 && (
              <Chip
                label={`+${ticket.tags.length - 2}`}
                size="small"
                sx={{ fontSize: '0.6rem', height: 20 }}
              />
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para área de drop da coluna
const DroppableColumn = ({ status, children }: { status: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minHeight: 100,
        backgroundColor: isOver ? 'action.hover' : 'transparent',
        borderRadius: 1,
        p: 1,
        transition: 'background-color 0.2s ease',
      }}
    >
      {children}
    </Box>
  );
};

export default function TicketsPage() {
  // Calcular datas padrão (hoje - 1 mês)
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);

  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewTicketModalOpen, setIsNewTicketModalOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [currentUser] = useState('João Silva'); // Simular usuário logado
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [newTicketForm, setNewTicketForm] = useState({
    title: '',
    description: '',
    priority: 'medium' as Ticket['priority'],
    category: '',
    assignee: '',
    tags: [] as string[],
  });
  const [newTag, setNewTag] = useState('');
  const [newTicketFiles, setNewTicketFiles] = useState<File[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    priority: '',
    category: '',
    assignee: '',
    dataInicial: oneMonthAgo,
    dataFinal: today,
  });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  // Filtros disponíveis
  const categories = [...new Set(tickets.map((ticket) => ticket.category))];
  const assignees = [...new Set(tickets.map((ticket) => ticket.assignee))];

  // Filtrar tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(filters.search.toLowerCase());
    const matchesPriority = !filters.priority || ticket.priority === filters.priority;
    const matchesCategory = !filters.category || ticket.category === filters.category;
    const matchesAssignee = !filters.assignee || ticket.assignee === filters.assignee;

    // Filtro de data
    const ticketDate = new Date(ticket.createdAt);
    const dataInicial = filters.dataInicial ? new Date(filters.dataInicial) : null;
    const dataFinal = filters.dataFinal ? new Date(filters.dataFinal) : null;

    const matchesDate =
      (!dataInicial || ticketDate >= dataInicial) && (!dataFinal || ticketDate <= dataFinal);

    return matchesSearch && matchesPriority && matchesCategory && matchesAssignee && matchesDate;
  });

  // Agrupar tickets por status
  const ticketsByStatus = {
    todo: filteredTickets.filter((ticket) => ticket.status === 'todo'),
    inProgress: filteredTickets.filter((ticket) => ticket.status === 'inProgress'),
    inReview: filteredTickets.filter((ticket) => ticket.status === 'inReview'),
    done: filteredTickets.filter((ticket) => ticket.status === 'done'),
  };

  const handleFilterChange = (field: string, value: string | Date | null) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeTicket = tickets.find((ticket) => ticket.id === activeId);

    if (!activeTicket) return;

    // Verificar se o overId é um status (coluna)
    const statusKeys = Object.keys(statusConfig);
    const isOverStatus = statusKeys.includes(overId);

    if (isOverStatus) {
      // Movendo para uma coluna específica
      const newStatus = overId as Ticket['status'];
      setTickets((prev) =>
        prev.map((ticket) => (ticket.id === activeId ? { ...ticket, status: newStatus } : ticket)),
      );
    } else {
      // Movendo sobre outro ticket
      const overTicket = tickets.find((ticket) => ticket.id === overId);

      if (!overTicket) return;

      // Se os tickets estão em status diferentes, mover para o status do ticket de destino
      if (activeTicket.status !== overTicket.status) {
        setTickets((prev) =>
          prev.map((ticket) =>
            ticket.id === activeId ? { ...ticket, status: overTicket.status } : ticket,
          ),
        );
      } else {
        // Se estão no mesmo status, reordenar
        const oldIndex = tickets.findIndex((ticket) => ticket.id === activeId);
        const newIndex = tickets.findIndex((ticket) => ticket.id === overId);

        setTickets((prev) => arrayMove(prev, oldIndex, newIndex));
      }
    }
  };

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);
  };

  const handleStatusChange = (ticketId: string, newStatus: Ticket['status']) => {
    setTickets((prev) =>
      prev.map((ticket) => (ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket)),
    );

    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTicket(null);
    setNewMessage('');
    setSelectedFiles([]);
  };

  const handleOpenNewTicketModal = () => {
    setIsNewTicketModalOpen(true);
  };

  const handleCloseNewTicketModal = () => {
    setIsNewTicketModalOpen(false);
    setNewTicketForm({
      title: '',
      description: '',
      priority: 'medium',
      category: '',
      assignee: '',
      tags: [],
    });
    setNewTag('');
    setNewTicketFiles([]);
  };

  const handleNewTicketFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setNewTicketFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveNewTicketFile = (index: number) => {
    setNewTicketFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleNewTicketFormChange = (field: string, value: string | string[]) => {
    setNewTicketForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !newTicketForm.tags.includes(newTag.trim())) {
      setNewTicketForm((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewTicketForm((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleCreateTicket = () => {
    if (!newTicketForm.title.trim() || !newTicketForm.description.trim()) {
      return;
    }

    // Criar anexos simulados
    const attachments: Attachment[] = newTicketFiles.map((file, index) => ({
      id: Date.now().toString() + index,
      name: file.name,
      url: URL.createObjectURL(file), // Em produção, seria upload real
      type: getFileType(file),
      size: file.size,
      uploadedBy: currentUser,
      uploadedAt: new Date().toISOString(),
    }));

    const newTicket: Ticket = {
      id: Date.now().toString(),
      title: newTicketForm.title,
      description: newTicketForm.description,
      status: 'todo',
      priority: newTicketForm.priority,
      assignee: newTicketForm.assignee || 'Não atribuído',
      reporter: currentUser,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: newTicketForm.category || 'Geral',
      tags: newTicketForm.tags,
      messages: [
        {
          id: Date.now().toString(),
          author: currentUser,
          content: newTicketForm.description,
          timestamp: new Date().toISOString(),
          mentions: [],
          type: 'comment',
          attachments: attachments.length > 0 ? attachments : undefined,
        },
      ],
    };

    setTickets((prev) => [newTicket, ...prev]);
    handleCloseNewTicketModal();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileType = (file: File): Attachment['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('text/') || file.type.includes('document')) return 'document';
    return 'other';
  };

  const handleSendMessage = () => {
    if ((!newMessage.trim() && selectedFiles.length === 0) || !selectedTicket) return;

    // Extrair menções do texto (@nome)
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;
    while ((match = mentionRegex.exec(newMessage)) !== null) {
      mentions.push(match[1]);
    }

    // Criar anexos simulados
    const attachments: Attachment[] = selectedFiles.map((file, index) => ({
      id: Date.now().toString() + index,
      name: file.name,
      url: URL.createObjectURL(file), // Em produção, seria upload real
      type: getFileType(file),
      size: file.size,
      uploadedBy: currentUser,
      uploadedAt: new Date().toISOString(),
    }));

    const message: Message = {
      id: Date.now().toString(),
      author: currentUser,
      content: newMessage,
      timestamp: new Date().toISOString(),
      mentions,
      type: 'comment',
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    setTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === selectedTicket.id
          ? { ...ticket, messages: [...ticket.messages, message] }
          : ticket,
      ),
    );

    setSelectedTicket((prev) => (prev ? { ...prev, messages: [...prev.messages, message] } : null));

    setNewMessage('');
    setSelectedFiles([]);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMessageContent = (content: string, mentions: string[]) => {
    let formattedContent = content;
    mentions.forEach((mention) => {
      const regex = new RegExp(`@${mention}`, 'g');
      formattedContent = formattedContent.replace(
        regex,
        `<span style="color: #1976d2; font-weight: 600;">@${mention}</span>`,
      );
    });
    return formattedContent;
  };

  const activeTicket = activeId ? tickets.find((ticket) => ticket.id === activeId) : null;

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight={600} sx={{ mb: 1 }}>
              Chamados
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gerencie os chamados de suporte da empresa.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ borderRadius: 2 }}
            onClick={handleOpenNewTicketModal}
          >
            Novo Chamado
          </Button>
        </Box>

        {/* Filtros */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <FilterIcon sx={{ mr: 1 }} />
              Filtros
            </Typography>

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Buscar chamados..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Prioridade</InputLabel>
                    <Select
                      value={filters.priority}
                      label="Prioridade"
                      onChange={(e) => handleFilterChange('priority', e.target.value)}
                    >
                      <MenuItem value="">Todas</MenuItem>
                      <MenuItem value="low">Baixa</MenuItem>
                      <MenuItem value="medium">Média</MenuItem>
                      <MenuItem value="high">Alta</MenuItem>
                      <MenuItem value="critical">Crítica</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Categoria</InputLabel>
                    <Select
                      value={filters.category}
                      label="Categoria"
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <MenuItem value="">Todas</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Responsável</InputLabel>
                    <Select
                      value={filters.assignee}
                      label="Responsável"
                      onChange={(e) => handleFilterChange('assignee', e.target.value)}
                    >
                      <MenuItem value="">Todos</MenuItem>
                      {assignees.map((assignee) => (
                        <MenuItem key={assignee} value={assignee}>
                          {assignee}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Data Inicial"
                    value={filters.dataInicial}
                    onChange={(newValue) => handleFilterChange('dataInicial', newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'medium',
                        InputProps: {
                          style: { fontSize: '14px' },
                        },
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <DatePicker
                    label="Data Final"
                    value={filters.dataFinal}
                    onChange={(newValue) => handleFilterChange('dataFinal', newValue)}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: 'medium',
                        InputProps: {
                          style: { fontSize: '14px' },
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </CardContent>
        </Card>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <Grid container spacing={3}>
            {Object.entries(statusConfig).map(([status, config]) => (
              <Grid item xs={12} md={3} key={status}>
                <Paper
                  sx={{
                    p: 2,
                    height: 'fit-content',
                    minHeight: 600,
                    backgroundColor: 'background.default',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: config.color,
                        mr: 1,
                      }}
                    />
                    <Typography variant="h6" sx={{ flex: 1 }}>
                      {config.label}
                    </Typography>
                    <Badge
                      badgeContent={ticketsByStatus[status as keyof typeof ticketsByStatus].length}
                      color="primary"
                    />
                  </Box>

                  <DroppableColumn status={status}>
                    <SortableContext
                      items={ticketsByStatus[status as keyof typeof ticketsByStatus].map(
                        (ticket) => ticket.id,
                      )}
                      strategy={verticalListSortingStrategy}
                    >
                      <Box sx={{ minHeight: 100 }}>
                        {ticketsByStatus[status as keyof typeof ticketsByStatus].map((ticket) => (
                          <SortableTicketCard
                            key={ticket.id}
                            ticket={ticket}
                            onClick={() => handleTicketClick(ticket)}
                          />
                        ))}
                      </Box>
                    </SortableContext>
                  </DroppableColumn>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <DragOverlay>
            {activeTicket ? (
              <Card
                sx={{
                  mb: 2,
                  cursor: 'grabbing',
                  boxShadow: 3,
                  transform: 'rotate(5deg)',
                }}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      mb: 1,
                    }}
                  >
                    <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1, mr: 1 }}>
                      {activeTicket.title}
                    </Typography>
                    <Chip
                      label={priorityConfig[activeTicket.priority].label}
                      size="small"
                      sx={{
                        backgroundColor: priorityConfig[activeTicket.priority].color,
                        color: 'white',
                        fontSize: '0.7rem',
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1.5, lineHeight: 1.4 }}
                  >
                    {activeTicket.description.length > 80
                      ? `${activeTicket.description.substring(0, 80)}...`
                      : activeTicket.description}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>
                      {activeTicket.assignee.charAt(0)}
                    </Avatar>
                    <Typography variant="caption" color="text.secondary">
                      {activeTicket.assignee}
                    </Typography>
                  </Box>

                  <Box
                    sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <Chip
                      label={activeTicket.category}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(activeTicket.updatedAt)}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ) : null}
          </DragOverlay>
        </DndContext>

        {/* Modal de Detalhes */}
        <Dialog open={isModalOpen} onClose={handleCloseModal} maxWidth="md" fullWidth>
          {selectedTicket && (
            <>
              <DialogTitle sx={{ pb: 1 }}>
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {selectedTicket.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small">
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={handleCloseModal}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Box>
              </DialogTitle>

              <DialogContent>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Descrição
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 3 }}>
                      {selectedTicket.description}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                      {selectedTicket.tags.map((tag, index) => (
                        <Chip key={index} label={tag} size="small" />
                      ))}
                    </Box>

                    {/* Chat/Histórico */}
                    <Divider sx={{ my: 3 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Histórico de Conversas
                    </Typography>

                    <Box sx={{ maxHeight: 400, overflowY: 'auto', mb: 2 }}>
                      <List>
                        {selectedTicket.messages.map((message) => (
                          <ListItem key={message.id} sx={{ px: 0 }}>
                            <ListItemAvatar>
                              <Avatar sx={{ width: 32, height: 32 }}>
                                {message.author.charAt(0)}
                              </Avatar>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {message.author}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(message.timestamp)}
                                  </Typography>
                                  {message.type === 'status_update' && (
                                    <Chip
                                      label="Atualização"
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      sx={{ fontSize: '0.6rem' }}
                                    />
                                  )}
                                </Box>
                              }
                              secondary={
                                <span>
                                  <span
                                    style={{
                                      marginTop: '8px',
                                      display: 'block',
                                    }}
                                    dangerouslySetInnerHTML={{
                                      __html: formatMessageContent(
                                        message.content,
                                        message.mentions,
                                      ),
                                    }}
                                  />

                                  {/* Anexos */}
                                  {message.attachments && message.attachments.length > 0 && (
                                    <span style={{ marginTop: '16px', display: 'block' }}>
                                      <span
                                        style={{
                                          fontSize: '0.75rem',
                                          color: 'rgba(0, 0, 0, 0.6)',
                                          marginBottom: '8px',
                                          display: 'block',
                                        }}
                                      >
                                        Anexos:
                                      </span>
                                      <span
                                        style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}
                                      >
                                        {message.attachments.map((attachment) => (
                                          <span
                                            key={attachment.id}
                                            style={{
                                              padding: '8px',
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: '8px',
                                              maxWidth: '200px',
                                              cursor: 'pointer',
                                              backgroundColor: '#f5f5f5',
                                              borderRadius: '4px',
                                              border: '1px solid #e0e0e0',
                                            }}
                                            onClick={() => window.open(attachment.url, '_blank')}
                                          >
                                            {attachment.type === 'image' ? (
                                              <ImageIcon color="primary" />
                                            ) : attachment.type === 'document' ? (
                                              <DescriptionIcon color="primary" />
                                            ) : (
                                              <AttachFileIcon color="primary" />
                                            )}
                                            <span style={{ minWidth: 0, flex: 1 }}>
                                              <span
                                                style={{
                                                  fontSize: '0.75rem',
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  whiteSpace: 'nowrap',
                                                  display: 'block',
                                                }}
                                              >
                                                {attachment.name}
                                              </span>
                                              <span
                                                style={{
                                                  fontSize: '0.75rem',
                                                  color: 'rgba(0, 0, 0, 0.6)',
                                                  display: 'block',
                                                }}
                                              >
                                                {formatFileSize(attachment.size)}
                                              </span>
                                            </span>
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                window.open(attachment.url, '_blank');
                                              }}
                                            >
                                              <DownloadIcon fontSize="small" />
                                            </IconButton>
                                          </span>
                                        ))}
                                      </span>
                                    </span>
                                  )}
                                </span>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>

                    {/* Input para nova mensagem */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
                      <TextField
                        fullWidth
                        multiline
                        rows={2}
                        placeholder="Digite sua mensagem... Use @nome para mencionar alguém"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <input
                                type="file"
                                multiple
                                accept="image/*,.pdf,.doc,.docx,.txt"
                                style={{ display: 'none' }}
                                id="file-upload"
                                onChange={handleFileSelect}
                              />
                              <label htmlFor="file-upload">
                                <IconButton component="span" color="primary">
                                  <AttachFileIcon />
                                </IconButton>
                              </label>
                              <IconButton
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() && selectedFiles.length === 0}
                                color="primary"
                              >
                                <SendIcon />
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    {/* Lista de arquivos selecionados */}
                    {selectedFiles.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mb: 1, display: 'block' }}
                        >
                          Arquivos selecionados:
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedFiles.map((file, index) => (
                            <Paper
                              key={index}
                              sx={{
                                p: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                maxWidth: 200,
                              }}
                            >
                              {getFileType(file) === 'image' ? (
                                <ImageIcon color="primary" />
                              ) : getFileType(file) === 'document' ? (
                                <DescriptionIcon color="primary" />
                              ) : (
                                <AttachFileIcon color="primary" />
                              )}
                              <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography variant="caption" noWrap>
                                  {file.name}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  display="block"
                                >
                                  {formatFileSize(file.size)}
                                </Typography>
                              </Box>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveFile(index)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Paper>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Grid>

                  <Grid item xs={12} md={4}>
                    <Stack spacing={2}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Status
                        </Typography>
                        <FormControl fullWidth size="small">
                          <Select
                            value={selectedTicket.status}
                            onChange={(e) =>
                              handleStatusChange(
                                selectedTicket.id,
                                e.target.value as Ticket['status'],
                              )
                            }
                          >
                            {Object.entries(statusConfig).map(([status, config]) => (
                              <MenuItem key={status} value={status}>
                                {config.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Prioridade
                        </Typography>
                        <Chip
                          label={priorityConfig[selectedTicket.priority].label}
                          sx={{
                            backgroundColor: priorityConfig[selectedTicket.priority].color,
                            color: 'white',
                          }}
                        />
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Responsável
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                            {selectedTicket.assignee.charAt(0)}
                          </Avatar>
                          <Typography variant="body2">{selectedTicket.assignee}</Typography>
                        </Box>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Solicitante
                        </Typography>
                        <Typography variant="body2">{selectedTicket.reporter}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Categoria
                        </Typography>
                        <Chip label={selectedTicket.category} variant="outlined" />
                      </Box>

                      <Divider />

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Criado em
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(selectedTicket.createdAt)}
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                          Última atualização
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(selectedTicket.updatedAt)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </DialogContent>

              <DialogActions sx={{ p: 3, pt: 1 }}>
                <Button onClick={handleCloseModal}>Fechar</Button>
                <Button variant="contained">Editar Chamado</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Modal de Novo Chamado */}
        <Dialog
          open={isNewTicketModalOpen}
          onClose={handleCloseNewTicketModal}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6">Novo Chamado</Typography>
              <IconButton onClick={handleCloseNewTicketModal}>
                <CloseIcon />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Título do Chamado"
                  placeholder="Digite um título descritivo"
                  value={newTicketForm.title}
                  onChange={(e) => handleNewTicketFormChange('title', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Descrição"
                  placeholder="Descreva detalhadamente o problema ou solicitação"
                  value={newTicketForm.description}
                  onChange={(e) => handleNewTicketFormChange('description', e.target.value)}
                  required
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Prioridade</InputLabel>
                  <Select
                    value={newTicketForm.priority}
                    label="Prioridade"
                    onChange={(e) => handleNewTicketFormChange('priority', e.target.value)}
                  >
                    <MenuItem value="low">Baixa</MenuItem>
                    <MenuItem value="medium">Média</MenuItem>
                    <MenuItem value="high">Alta</MenuItem>
                    <MenuItem value="critical">Crítica</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Categoria</InputLabel>
                  <Select
                    value={newTicketForm.category}
                    label="Categoria"
                    onChange={(e) => handleNewTicketFormChange('category', e.target.value)}
                  >
                    <MenuItem value="">Selecione uma categoria</MenuItem>
                    <MenuItem value="Sistema">Sistema</MenuItem>
                    <MenuItem value="Interface">Interface</MenuItem>
                    <MenuItem value="Relatórios">Relatórios</MenuItem>
                    <MenuItem value="Perfil">Perfil</MenuItem>
                    <MenuItem value="Integração">Integração</MenuItem>
                    <MenuItem value="Geral">Geral</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Responsável</InputLabel>
                  <Select
                    value={newTicketForm.assignee}
                    label="Responsável"
                    onChange={(e) => handleNewTicketFormChange('assignee', e.target.value)}
                  >
                    <MenuItem value="">Selecione um responsável</MenuItem>
                    <MenuItem value="João Silva">João Silva</MenuItem>
                    <MenuItem value="Ana Costa">Ana Costa</MenuItem>
                    <MenuItem value="Carlos Lima">Carlos Lima</MenuItem>
                    <MenuItem value="Roberto Alves">Roberto Alves</MenuItem>
                    <MenuItem value="Mariana Santos">Mariana Santos</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                    {newTicketForm.tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        onDelete={() => handleRemoveTag(tag)}
                        size="small"
                      />
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      size="small"
                      placeholder="Adicionar tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleAddTag}
                      disabled={!newTag.trim()}
                    >
                      Adicionar
                    </Button>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Anexos
                </Typography>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                  id="new-ticket-file-upload"
                  onChange={handleNewTicketFileSelect}
                />
                <label htmlFor="new-ticket-file-upload">
                  <Button
                    variant="outlined"
                    startIcon={<AttachFileIcon />}
                    fullWidth
                    component="span"
                  >
                    Adicionar Anexo
                  </Button>
                </label>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Anexos Selecionados:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {newTicketFiles.map((file, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          maxWidth: 200,
                        }}
                      >
                        {getFileType(file) === 'image' ? (
                          <ImageIcon color="primary" />
                        ) : getFileType(file) === 'document' ? (
                          <DescriptionIcon color="primary" />
                        ) : (
                          <AttachFileIcon color="primary" />
                        )}
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography variant="caption" noWrap>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {formatFileSize(file.size)}
                          </Typography>
                        </Box>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveNewTicketFile(index)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button onClick={handleCloseNewTicketModal}>Cancelar</Button>
            <Button
              variant="contained"
              onClick={handleCreateTicket}
              disabled={!newTicketForm.title.trim() || !newTicketForm.description.trim()}
            >
              Criar Chamado
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardLayout>
  );
}
