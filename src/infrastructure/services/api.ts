import {
  Client,
  ClientFilters,
  CreateClientRequest,
  UpdateClientRequest,
} from '@/domain/entities/Client';
import {
  CreateOrderRequest,
  Order,
  OrderFilters,
  UpdateOrderRequest,
} from '@/domain/entities/Order';
import {
  CreateProductRequest,
  Product,
  ProductFilters,
  UpdateProductRequest,
} from '@/domain/entities/Product';
import {
  CreateTicketRequest,
  Ticket,
  TicketFilters,
  UpdateTicketRequest,
} from '@/domain/entities/Ticket';

// Simular delay de rede
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock data
const mockClients: Client[] = [
  {
    id: '1',
    codigo: 'CLI001',
    nome: 'João Silva',
    cpf: '123.456.789-00',
    cep: '12345-678',
    endereco: 'Rua das Flores, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    bairro: 'Centro',
    numero: '123',
    complemento: 'Apto 1',
    email: 'joao@email.com',
    telefone: '(11) 99999-9999',
    instagram: '@joaosilva',
    dataUltimaCompra: new Date('2024-01-15'),
    quantidadeCompras: 5,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    codigo: 'CLI002',
    nome: 'Maria Santos',
    cpf: '987.654.321-00',
    cep: '54321-876',
    endereco: 'Av. Principal, 456',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    bairro: 'Copacabana',
    numero: '456',
    complemento: '',
    email: 'maria@email.com',
    telefone: '(21) 88888-8888',
    instagram: '@mariasantos',
    dataUltimaCompra: new Date('2024-01-10'),
    quantidadeCompras: 3,
    createdAt: new Date('2023-02-01'),
    updatedAt: new Date('2024-01-10'),
  },
];

const mockOrders: Order[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'João Silva',
    items: [
      {
        id: '1',
        productId: '1',
        productName: 'Produto A',
        quantity: 2,
        unitPrice: 100,
        totalPrice: 200,
      },
    ],
    total: 200,
    status: 'pending',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

const mockProducts: Product[] = [
  {
    id: '1',
    codigo: 'PROD001',
    nome: 'Produto A',
    descricao: 'Descrição do produto A',
    preco: 100,
    estoque: 50,
    categoria: 'Eletrônicos',
    fornecedor: 'Fornecedor A',
    ativo: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

const mockTickets: Ticket[] = [
  {
    id: '1',
    titulo: 'Problema com login',
    descricao: 'Não consigo fazer login no sistema',
    prioridade: 'alta',
    status: 'aberto',
    categoria: 'Sistema',
    tags: ['login', 'urgente'],
    criadoPor: 'usuario1',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

// API Clients
export const clientsApi = {
  async getClients(filters?: ClientFilters): Promise<Client[]> {
    await delay(500); // Simular delay de rede

    let filteredClients = [...mockClients];

    if (filters) {
      if (filters.nome) {
        filteredClients = filteredClients.filter((client) =>
          client.nome.toLowerCase().includes(filters.nome!.toLowerCase()),
        );
      }
      if (filters.cidade) {
        filteredClients = filteredClients.filter((client) => client.cidade === filters.cidade);
      }
    }

    return filteredClients;
  },

  async getClientById(id: string): Promise<Client | null> {
    await delay(300);
    return mockClients.find((client) => client.id === id) || null;
  },

  async createClient(clientData: CreateClientRequest): Promise<Client> {
    await delay(500);
    const newClient: Client = {
      ...clientData,
      complemento: clientData.complemento || '',
      instagram: clientData.instagram || '',
      id: Date.now().toString(),
      codigo: `CLI${String(mockClients.length + 1).padStart(3, '0')}`,
      dataUltimaCompra: new Date(),
      quantidadeCompras: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockClients.push(newClient);
    return newClient;
  },

  async updateClient(id: string, clientData: UpdateClientRequest): Promise<Client> {
    await delay(500);
    const index = mockClients.findIndex((client) => client.id === id);
    if (index === -1) {
      throw new Error('Cliente não encontrado');
    }

    const updatedClient = {
      ...mockClients[index],
      ...clientData,
      updatedAt: new Date(),
    };
    mockClients[index] = updatedClient;
    return updatedClient;
  },

  async deleteClient(id: string): Promise<void> {
    await delay(300);
    const index = mockClients.findIndex((client) => client.id === id);
    if (index === -1) {
      throw new Error('Cliente não encontrado');
    }
    mockClients.splice(index, 1);
  },

  async getCities(): Promise<string[]> {
    await delay(200);
    return [...new Set(mockClients.map((client) => client.cidade))];
  },
};

// API Orders
export const ordersApi = {
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    await delay(500);

    let filteredOrders = [...mockOrders];

    if (filters) {
      if (filters.clientName) {
        filteredOrders = filteredOrders.filter((order) =>
          order.clientName.toLowerCase().includes(filters.clientName!.toLowerCase()),
        );
      }
      if (filters.status) {
        filteredOrders = filteredOrders.filter((order) => order.status === filters.status);
      }
    }

    return filteredOrders;
  },

  async getOrderById(id: string): Promise<Order | null> {
    await delay(300);
    return mockOrders.find((order) => order.id === id) || null;
  },

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    await delay(500);
    const client = mockClients.find((c) => c.id === orderData.clientId);
    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    const newOrder: Order = {
      id: Date.now().toString(),
      clientId: orderData.clientId,
      clientName: client.nome,
      items: orderData.items.map((item, index) => ({
        id: `${Date.now()}-${index}`,
        productId: item.productId,
        productName: 'Produto', // Em uma implementação real, buscaria o nome do produto
        quantity: item.quantity,
        unitPrice: 100, // Em uma implementação real, buscaria o preço do produto
        totalPrice: item.quantity * 100,
      })),
      total: orderData.items.reduce((sum, item) => sum + item.quantity * 100, 0),
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockOrders.push(newOrder);
    return newOrder;
  },

  async updateOrder(id: string, orderData: UpdateOrderRequest): Promise<Order> {
    await delay(500);
    const index = mockOrders.findIndex((order) => order.id === id);
    if (index === -1) {
      throw new Error('Pedido não encontrado');
    }

    // Primeiro, faz o spread normalmente
    const updatedOrder = {
      ...mockOrders[index],
      ...orderData,
      updatedAt: new Date(),
    };
    // Corrigir o tipo de items se fornecido
    if (orderData.items) {
      (updatedOrder as Order).items = orderData.items.map((item, idx) => ({
        id: `${Date.now()}-${idx}`,
        productId: item.productId,
        productName: 'Produto',
        quantity: item.quantity,
        unitPrice: 100,
        totalPrice: item.quantity * 100,
      }));
    }
    mockOrders[index] = updatedOrder as Order;
    return updatedOrder as Order;
  },

  async deleteOrder(id: string): Promise<void> {
    await delay(300);
    const index = mockOrders.findIndex((order) => order.id === id);
    if (index === -1) {
      throw new Error('Pedido não encontrado');
    }
    mockOrders.splice(index, 1);
  },
};

// API Products
export const productsApi = {
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    await delay(500);

    let filteredProducts = [...mockProducts];

    if (filters) {
      if (filters.nome) {
        filteredProducts = filteredProducts.filter((product) =>
          product.nome.toLowerCase().includes(filters.nome!.toLowerCase()),
        );
      }
      if (filters.categoria) {
        filteredProducts = filteredProducts.filter(
          (product) => product.categoria === filters.categoria,
        );
      }
    }

    return filteredProducts;
  },

  async getProductById(id: string): Promise<Product | null> {
    await delay(300);
    return mockProducts.find((product) => product.id === id) || null;
  },

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    await delay(500);
    const newProduct: Product = {
      ...productData,
      id: Date.now().toString(),
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockProducts.push(newProduct);
    return newProduct;
  },

  async updateProduct(id: string, productData: UpdateProductRequest): Promise<Product> {
    await delay(500);
    const index = mockProducts.findIndex((product) => product.id === id);
    if (index === -1) {
      throw new Error('Produto não encontrado');
    }

    const updatedProduct = {
      ...mockProducts[index],
      ...productData,
      updatedAt: new Date(),
    };
    mockProducts[index] = updatedProduct;
    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<void> {
    await delay(300);
    const index = mockProducts.findIndex((product) => product.id === id);
    if (index === -1) {
      throw new Error('Produto não encontrado');
    }
    mockProducts.splice(index, 1);
  },

  async getCategories(): Promise<string[]> {
    await delay(200);
    return [...new Set(mockProducts.map((product) => product.categoria))];
  },

  async getSuppliers(): Promise<string[]> {
    await delay(200);
    return [...new Set(mockProducts.map((product) => product.fornecedor))];
  },
};

// API Tickets
export const ticketsApi = {
  async getTickets(filters?: TicketFilters): Promise<Ticket[]> {
    await delay(500);

    let filteredTickets = [...mockTickets];

    if (filters) {
      if (filters.titulo) {
        filteredTickets = filteredTickets.filter((ticket) =>
          ticket.titulo.toLowerCase().includes(filters.titulo!.toLowerCase()),
        );
      }
      if (filters.prioridade) {
        filteredTickets = filteredTickets.filter(
          (ticket) => ticket.prioridade === filters.prioridade,
        );
      }
      if (filters.status) {
        filteredTickets = filteredTickets.filter((ticket) => ticket.status === filters.status);
      }
    }

    return filteredTickets;
  },

  async getTicketById(id: string): Promise<Ticket | null> {
    await delay(300);
    return mockTickets.find((ticket) => ticket.id === id) || null;
  },

  async createTicket(ticketData: CreateTicketRequest): Promise<Ticket> {
    await delay(500);
    const newTicket: Ticket = {
      ...ticketData,
      id: Date.now().toString(),
      tags: ticketData.tags || [],
      criadoPor: 'usuario1', // Em uma implementação real, viria do contexto de autenticação
      status: 'aberto',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockTickets.push(newTicket);
    return newTicket;
  },

  async updateTicket(id: string, ticketData: UpdateTicketRequest): Promise<Ticket> {
    await delay(500);
    const index = mockTickets.findIndex((ticket) => ticket.id === id);
    if (index === -1) {
      throw new Error('Ticket não encontrado');
    }

    const updatedTicket = {
      ...mockTickets[index],
      ...ticketData,
      updatedAt: new Date(),
    };
    mockTickets[index] = updatedTicket;
    return updatedTicket;
  },

  async deleteTicket(id: string): Promise<void> {
    await delay(300);
    const index = mockTickets.findIndex((ticket) => ticket.id === id);
    if (index === -1) {
      throw new Error('Ticket não encontrado');
    }
    mockTickets.splice(index, 1);
  },

  async getCategories(): Promise<string[]> {
    await delay(200);
    return [...new Set(mockTickets.map((ticket) => ticket.categoria))];
  },

  async getPriorities(): Promise<string[]> {
    await delay(200);
    return ['baixa', 'media', 'alta', 'critica'];
  },
};
