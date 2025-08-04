import { CreateOrderRequest, Order, OrderFilters, UpdateOrderRequest } from '../entities/Order';

export interface IOrderRepository {
  findAll(filters?: OrderFilters): Promise<Order[]>;
  findById(id: string): Promise<Order | null>;
  create(order: CreateOrderRequest): Promise<Order>;
  update(id: string, order: UpdateOrderRequest): Promise<Order>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: string): Promise<Order>;
}
