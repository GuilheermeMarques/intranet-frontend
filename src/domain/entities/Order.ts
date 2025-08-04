export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  clientId: string;
  clientName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  shippedAt?: Date;
  deliveredAt?: Date;
}

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'canceled';

export interface OrderFilters {
  orderCode?: string;
  clientName?: string;
  status?: OrderStatus;
  startDate?: Date;
  endDate?: Date;
}

export interface CreateOrderRequest {
  clientId: string;
  items: CreateOrderItemRequest[];
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
}

export interface UpdateOrderRequest {
  id: string;
  status?: OrderStatus;
  items?: CreateOrderItemRequest[];
}
