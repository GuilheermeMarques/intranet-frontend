export interface Product {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Purchase {
  id: string;
  clientCode: string;
  orderNumber: string;
  date: string;
  total: number;
  products: Product[];
}

export interface PurchaseHistory {
  purchases: Purchase[];
}
