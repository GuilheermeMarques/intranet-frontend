import { CreateOrderRequest, Order, OrderFilters, UpdateOrderRequest } from '../entities/Order';
import { IOrderRepository } from '../repositories/IOrderRepository';

export class OrderUseCases {
  constructor(private orderRepository: IOrderRepository) {}

  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    return this.orderRepository.findAll(filters);
  }

  async getOrderById(id: string): Promise<Order | null> {
    return this.orderRepository.findById(id);
  }

  async createOrder(orderData: CreateOrderRequest): Promise<Order> {
    // Aqui você pode adicionar regras de negócio
    // Por exemplo, validar estoque, calcular totais, etc.
    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Pedido deve ter pelo menos um item');
    }

    return this.orderRepository.create(orderData);
  }

  async updateOrder(id: string, orderData: UpdateOrderRequest): Promise<Order> {
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw new Error('Pedido não encontrado');
    }

    return this.orderRepository.update(id, orderData);
  }

  async deleteOrder(id: string): Promise<void> {
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw new Error('Pedido não encontrado');
    }

    return this.orderRepository.delete(id);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const existingOrder = await this.orderRepository.findById(id);
    if (!existingOrder) {
      throw new Error('Pedido não encontrado');
    }

    return this.orderRepository.updateStatus(id, status);
  }
}
