import { z } from 'zod';

// Schema de validação para Cliente
export const ClientSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cpf: z.string().regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00'),
  cep: z.string().regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000'),
  endereco: z
    .string()
    .min(5, 'Endereço deve ter pelo menos 5 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres'),
  cidade: z
    .string()
    .min(2, 'Cidade deve ter pelo menos 2 caracteres')
    .max(100, 'Cidade deve ter no máximo 100 caracteres'),
  estado: z.string().length(2, 'Estado deve ter exatamente 2 caracteres'),
  bairro: z
    .string()
    .min(2, 'Bairro deve ter pelo menos 2 caracteres')
    .max(100, 'Bairro deve ter no máximo 100 caracteres'),
  numero: z
    .string()
    .min(1, 'Número é obrigatório')
    .max(10, 'Número deve ter no máximo 10 caracteres'),
  complemento: z.string().max(100, 'Complemento deve ter no máximo 100 caracteres').optional(),
  email: z.string().email('Email inválido').max(100, 'Email deve ter no máximo 100 caracteres'),
  telefone: z
    .string()
    .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone deve estar no formato (00) 00000-0000'),
  instagram: z
    .string()
    .regex(
      /^@[\w.]+$/,
      'Instagram deve começar com @ e conter apenas letras, números, pontos e underscores',
    )
    .max(30, 'Instagram deve ter no máximo 30 caracteres')
    .optional(),
});

// Schema de validação para Pedido
export const OrderSchema = z.object({
  clientId: z.string().min(1, 'Cliente é obrigatório'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Produto é obrigatório'),
        quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
      }),
    )
    .min(1, 'Pedido deve ter pelo menos um item'),
});

// Schema de validação para Item do Pedido
export const OrderItemSchema = z.object({
  productId: z.string().min(1, 'Produto é obrigatório'),
  quantity: z.number().min(1, 'Quantidade deve ser maior que 0'),
});

// Schema de validação para Produto
export const ProductSchema = z.object({
  codigo: z
    .string()
    .min(1, 'Código é obrigatório')
    .max(20, 'Código deve ter no máximo 20 caracteres'),
  nome: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  descricao: z.string().max(500, 'Descrição deve ter no máximo 500 caracteres').optional(),
  preco: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  estoque: z.number().min(0, 'Estoque deve ser maior ou igual a 0'),
  categoria: z
    .string()
    .min(1, 'Categoria é obrigatória')
    .max(50, 'Categoria deve ter no máximo 50 caracteres'),
  fornecedor: z
    .string()
    .min(1, 'Fornecedor é obrigatório')
    .max(100, 'Fornecedor deve ter no máximo 100 caracteres'),
  imagem: z.string().url('URL da imagem inválida').optional(),
});

// Schema de validação para Ticket
export const TicketSchema = z.object({
  titulo: z
    .string()
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  descricao: z
    .string()
    .min(10, 'Descrição deve ter pelo menos 10 caracteres')
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres'),
  prioridade: z.enum(['baixa', 'media', 'alta', 'critica']),
  categoria: z
    .string()
    .min(1, 'Categoria é obrigatória')
    .max(50, 'Categoria deve ter no máximo 50 caracteres'),
  tags: z.array(z.string().max(20)).optional(),
  atribuidoPara: z.string().optional(),
});

// Schema de validação para Filtros de Cliente
export const ClientFiltersSchema = z.object({
  codigo: z.string().optional(),
  nome: z.string().optional(),
  cidade: z.string().optional(),
  dataInicial: z.date().optional(),
  dataFinal: z.date().optional(),
});

// Schema de validação para Filtros de Pedido
export const OrderFiltersSchema = z.object({
  orderCode: z.string().optional(),
  clientName: z.string().optional(),
  status: z.enum(['pending', 'shipped', 'delivered', 'canceled']).optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

// Schema de validação para Filtros de Produto
export const ProductFiltersSchema = z.object({
  codigo: z.string().optional(),
  nome: z.string().optional(),
  categoria: z.string().optional(),
  fornecedor: z.string().optional(),
  ativo: z.boolean().optional(),
  estoqueMinimo: z.number().min(0).optional(),
});

// Schema de validação para Filtros de Ticket
export const TicketFiltersSchema = z.object({
  titulo: z.string().optional(),
  prioridade: z.enum(['baixa', 'media', 'alta', 'critica']).optional(),
  status: z.enum(['aberto', 'em_andamento', 'resolvido', 'fechado']).optional(),
  categoria: z.string().optional(),
  criadoPor: z.string().optional(),
  atribuidoPara: z.string().optional(),
  dataInicial: z.date().optional(),
  dataFinal: z.date().optional(),
});

// Tipos derivados dos schemas
export type ClientFormData = z.infer<typeof ClientSchema>;
export type OrderFormData = z.infer<typeof OrderSchema>;
export type OrderItemFormData = z.infer<typeof OrderItemSchema>;
export type ProductFormData = z.infer<typeof ProductSchema>;
export type TicketFormData = z.infer<typeof TicketSchema>;
export type ClientFiltersData = z.infer<typeof ClientFiltersSchema>;
export type OrderFiltersData = z.infer<typeof OrderFiltersSchema>;
export type ProductFiltersData = z.infer<typeof ProductFiltersSchema>;
export type TicketFiltersData = z.infer<typeof TicketFiltersSchema>;
