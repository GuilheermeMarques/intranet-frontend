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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const nowIso = () => new Date().toISOString();

const mockClients: Client[] = [
  {
    id: '1',
    codigo: 'CLI001',
    nome: 'João Silva',
    cpf: '123.456.789-00',
    cep: '12345-678',
    endereco: 'Rua das Flores',
    cidade: 'São Paulo',
    estado: 'SP',
    bairro: 'Centro',
    numero: '123',
    complemento: 'Apto 1',
    email: 'joao@email.com',
    telefone: '(11) 99999-9999',
    instagram: '@joaosilva',
    dataUltimaCompra: '2024-01-15',
    quantidadeCompras: 5,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: '2',
    codigo: 'CLI002',
    nome: 'Maria Santos',
    cpf: '987.654.321-00',
    cep: '54321-876',
    endereco: 'Av. Principal',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    bairro: 'Copacabana',
    numero: '456',
    complemento: '',
    email: 'maria@email.com',
    telefone: '(21) 88888-8888',
    instagram: '@mariasantos',
    dataUltimaCompra: '2024-01-10',
    quantidadeCompras: 3,
    createdAt: '2023-02-01T00:00:00.000Z',
    updatedAt: '2024-01-10T00:00:00.000Z',
  },
];

const mockProducts: Product[] = [
  {
    id: '1',
    codigoProduto: 'PROD001',
    nomeProduto: 'Produto A',
    descricaoProduto: 'Descrição do produto A',
    preco: 100,
    quantidadeEstoque: 50,
    ultimaDataVenda: '2024-01-15',
    fornecedor: 'Fornecedor A',
    categoria: 'Eletrônicos',
    ativo: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
];

const mockOrders: Order[] = [
  {
    id: 'PED-001',
    clientId: '1',
    clientCode: 'CLI001',
    clientName: 'João Silva',
    clientEmail: 'joao@email.com',
    clientPhone: '(11) 99999-9999',
    items: [
      {
        id: 'ITEM-001',
        productId: '1',
        productCode: 'PROD001',
        productName: 'Produto A',
        quantity: 2,
        unitPrice: 100,
        total: 200,
      },
    ],
    total: 220,
    shippingCost: 20,
    status: 'pending',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    notes: 'Entrega padrão',
  },
];

const mockTickets: Ticket[] = [
  {
    id: '1',
    title: 'Problema com login',
    description: 'Não consigo fazer login no sistema',
    status: 'todo',
    priority: 'priority-4',
    assignee: 'João Silva',
    reporter: 'Usuário 1',
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    category: 'Sistema',
    tags: ['tag-1'],
    messages: [],
  },
];

export const clientsApi = {
  async getClients(filters?: ClientFilters): Promise<Client[]> {
    await delay(500);

    let filteredClients = [...mockClients];

    if (filters?.codigo) {
      filteredClients = filteredClients.filter((client) =>
        client.codigo.toLowerCase().includes(filters.codigo!.toLowerCase()),
      );
    }

    if (filters?.nome) {
      filteredClients = filteredClients.filter((client) =>
        client.nome.toLowerCase().includes(filters.nome!.toLowerCase()),
      );
    }

    if (filters?.cidade) {
      filteredClients = filteredClients.filter((client) => client.cidade === filters.cidade);
    }

    return filteredClients;
  },

  async getClientById(id: string): Promise<Client | null> {
    await delay(300);
    return mockClients.find((client) => client.id === id) || null;
  },

  async createClient(clientData: CreateClientRequest): Promise<Client> {
    await delay(500);

    const timestamp = nowIso();
    const newClient: Client = {
      ...clientData,
      complemento: clientData.complemento || '',
      instagram: clientData.instagram || '',
      id: Date.now().toString(),
      codigo: `CLI${String(mockClients.length + 1).padStart(3, '0')}`,
      dataUltimaCompra: null,
      quantidadeCompras: 0,
      createdAt: timestamp,
      updatedAt: timestamp,
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

    const updatedClient: Client = {
      ...mockClients[index],
      ...clientData,
      updatedAt: nowIso(),
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

export const ordersApi = {
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    await delay(500);

    let filteredOrders = [...mockOrders];

    if (filters?.orderCode) {
      filteredOrders = filteredOrders.filter((order) =>
        order.id.toLowerCase().includes(filters.orderCode!.toLowerCase()),
      );
    }

    if (filters?.clientName) {
      filteredOrders = filteredOrders.filter((order) =>
        order.clientName.toLowerCase().includes(filters.clientName!.toLowerCase()),
      );
    }

    if (filters?.status) {
      filteredOrders = filteredOrders.filter((order) => order.status === filters.status);
    }

    return filteredOrders;
  },

  async getOrderById(id: string): Promise<Order | null> {
    await delay(300);
    return mockOrders.find((order) => order.id === id) || null;
  },

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    await delay(500);

    const client = mockClients.find((item) => item.id === orderData.clientId);
    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    const items = orderData.items.map((item, index) => {
      const product = mockProducts.find((candidate) => String(candidate.id) === item.productId);
      const unitPrice = item.unitPrice ?? product?.preco ?? 0;

      return {
        id: `${Date.now()}-${index}`,
        productId: item.productId,
        productCode: product?.codigoProduto,
        productName: product?.nomeProduto ?? 'Produto',
        quantity: item.quantity,
        unitPrice,
        total: item.quantity * unitPrice,
      };
    });

    const shippingCost = orderData.shippingCost ?? 0;
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const timestamp = nowIso();

    const newOrder: Order = {
      id: `PED-${String(mockOrders.length + 1).padStart(3, '0')}`,
      clientId: client.id,
      clientCode: client.codigo,
      clientName: client.nome,
      clientEmail: client.email,
      clientPhone: client.telefone,
      items,
      total: subtotal + shippingCost,
      shippingCost,
      status: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp,
      notes: orderData.notes,
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

    const currentOrder = mockOrders[index];
    let nextItems = currentOrder.items;

    if (orderData.items) {
      nextItems = orderData.items.map((item, index) => {
        const product = mockProducts.find((candidate) => String(candidate.id) === item.productId);
        const unitPrice = item.unitPrice ?? product?.preco ?? 0;

        return {
          id: `${Date.now()}-${index}`,
          productId: item.productId,
          productCode: product?.codigoProduto,
          productName: product?.nomeProduto ?? 'Produto',
          quantity: item.quantity,
          unitPrice,
          total: item.quantity * unitPrice,
        };
      });
    }

    const shippingCost = orderData.shippingCost ?? currentOrder.shippingCost;
    const subtotal = nextItems.reduce((sum, item) => sum + item.total, 0);

    const updatedOrder: Order = {
      ...currentOrder,
      status: orderData.status ?? currentOrder.status,
      items: nextItems,
      shippingCost,
      total: subtotal + shippingCost,
      notes: orderData.notes ?? currentOrder.notes,
      updatedAt: nowIso(),
    };

    mockOrders[index] = updatedOrder;
    return updatedOrder;
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

export const productsApi = {
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    await delay(500);

    let filteredProducts = [...mockProducts];

    if (filters?.codigoProduto) {
      filteredProducts = filteredProducts.filter((product) =>
        product.codigoProduto.toLowerCase().includes(filters.codigoProduto!.toLowerCase()),
      );
    }

    if (filters?.nomeProduto) {
      filteredProducts = filteredProducts.filter((product) =>
        product.nomeProduto.toLowerCase().includes(filters.nomeProduto!.toLowerCase()),
      );
    }

    if (filters?.categoria) {
      filteredProducts = filteredProducts.filter((product) => product.categoria === filters.categoria);
    }

    if (filters?.fornecedor) {
      filteredProducts = filteredProducts.filter((product) =>
        product.fornecedor.toLowerCase().includes(filters.fornecedor!.toLowerCase()),
      );
    }

    return filteredProducts;
  },

  async getProductById(id: string): Promise<Product | null> {
    await delay(300);
    return mockProducts.find((product) => String(product.id) === id) || null;
  },

  async createProduct(productData: CreateProductRequest): Promise<Product> {
    await delay(500);

    const timestamp = nowIso();
    const newProduct: Product = {
      id: Date.now().toString(),
      ...productData,
      categoria: productData.categoria,
      ativo: productData.ativo ?? true,
      createdAt: timestamp,
      updatedAt: timestamp,
      ultimaDataVenda: new Date().toISOString().split('T')[0],
    };

    mockProducts.push(newProduct);
    return newProduct;
  },

  async updateProduct(id: string, productData: UpdateProductRequest): Promise<Product> {
    await delay(500);
    const index = mockProducts.findIndex((product) => String(product.id) === String(id));

    if (index === -1) {
      throw new Error('Produto não encontrado');
    }

    const updatedProduct: Product = {
      ...mockProducts[index],
      ...productData,
      updatedAt: nowIso(),
    };

    mockProducts[index] = updatedProduct;
    return updatedProduct;
  },

  async deleteProduct(id: string): Promise<void> {
    await delay(300);
    const index = mockProducts.findIndex((product) => String(product.id) === String(id));

    if (index === -1) {
      throw new Error('Produto não encontrado');
    }

    mockProducts.splice(index, 1);
  },

  async getCategories(): Promise<string[]> {
    await delay(200);
    return [...new Set(mockProducts.map((product) => product.categoria).filter(Boolean))] as string[];
  },

  async getSuppliers(): Promise<string[]> {
    await delay(200);
    return [...new Set(mockProducts.map((product) => product.fornecedor))];
  },
};

export const ticketsApi = {
  async getTickets(filters?: TicketFilters): Promise<Ticket[]> {
    await delay(500);

    let filteredTickets = [...mockTickets];

    if (filters?.search) {
      const query = filters.search.toLowerCase();
      filteredTickets = filteredTickets.filter(
        (ticket) =>
          ticket.title.toLowerCase().includes(query) ||
          ticket.description.toLowerCase().includes(query),
      );
    }

    if (filters?.priority) {
      filteredTickets = filteredTickets.filter((ticket) => ticket.priority === filters.priority);
    }

    if (filters?.status) {
      filteredTickets = filteredTickets.filter((ticket) => ticket.status === filters.status);
    }

    if (filters?.category) {
      filteredTickets = filteredTickets.filter((ticket) => ticket.category === filters.category);
    }

    if (filters?.assignee) {
      filteredTickets = filteredTickets.filter((ticket) => ticket.assignee === filters.assignee);
    }

    return filteredTickets;
  },

  async getTicketById(id: string): Promise<Ticket | null> {
    await delay(300);
    return mockTickets.find((ticket) => ticket.id === id) || null;
  },

  async createTicket(ticketData: CreateTicketRequest): Promise<Ticket> {
    await delay(500);

    const timestamp = nowIso();
    const newTicket: Ticket = {
      id: Date.now().toString(),
      title: ticketData.title,
      description: ticketData.description,
      status: 'todo',
      priority: ticketData.priority,
      assignee: ticketData.assignee || 'Não atribuído',
      reporter: 'usuario1',
      createdAt: timestamp,
      updatedAt: timestamp,
      category: ticketData.category,
      tags: ticketData.tags || [],
      messages: [],
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

    const updatedTicket: Ticket = {
      ...mockTickets[index],
      title: ticketData.title ?? mockTickets[index].title,
      description: ticketData.description ?? mockTickets[index].description,
      priority: ticketData.priority ?? mockTickets[index].priority,
      status: ticketData.status ?? mockTickets[index].status,
      category: ticketData.category ?? mockTickets[index].category,
      tags: ticketData.tags ?? mockTickets[index].tags,
      assignee: ticketData.assignee ?? mockTickets[index].assignee,
      updatedAt: nowIso(),
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
    return [...new Set(mockTickets.map((ticket) => ticket.category))];
  },

  async getPriorities(): Promise<string[]> {
    await delay(200);
    return [...new Set(mockTickets.map((ticket) => ticket.priority))];
  },
};
