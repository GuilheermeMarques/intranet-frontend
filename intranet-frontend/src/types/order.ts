export interface OrderItem {
  id: string;
  productId?: string | number;
  productCode?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  clientId?: string;
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
