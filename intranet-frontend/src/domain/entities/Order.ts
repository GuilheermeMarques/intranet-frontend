import type { Order as BaseOrder, OrderItem as BaseOrderItem } from '@/types/order';

export interface OrderItem extends BaseOrderItem {
  productId?: string;
  productCode?: string;
}

export interface Order extends Omit<BaseOrder, 'items'> {
  clientId?: string;
  items: OrderItem[];
}

export type OrderStatus = Order['status'];

export interface OrderFilters {
  orderCode?: string;
  clientName?: string;
  status?: OrderStatus;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface CreateOrderRequest {
  clientId: string;
  items: CreateOrderItemRequest[];
  shippingCost?: number;
  notes?: string;
}

export interface CreateOrderItemRequest {
  productId: string;
  quantity: number;
  unitPrice?: number;
}

export interface UpdateOrderRequest {
  id: string;
  status?: OrderStatus;
  items?: CreateOrderItemRequest[];
  shippingCost?: number;
  notes?: string;
}
