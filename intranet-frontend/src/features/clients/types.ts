export interface Client {
  id: string;
  code: string;
  name: string;
  document: string;
  zipCode: string;
  street: string;
  city: string;
  state: string;
  neighborhood: string;
  number: string;
  complement: string;
  email: string;
  phone: string;
  instagram: string;
  lastPurchaseAt: string | null;
  purchaseCount: number;
}

export interface ClientFilters {
  code: string;
  name: string;
  city: string;
  startDate: Date | null;
  endDate: Date | null;
}

export interface ClientsData {
  clients: Client[];
  cities: string[];
}
