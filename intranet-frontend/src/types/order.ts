export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  clientCode: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  items: OrderItem[];
  total: number;
  shippingCost: number;
  status: 'pending' | 'shipped' | 'delivered' | 'canceled';
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}
