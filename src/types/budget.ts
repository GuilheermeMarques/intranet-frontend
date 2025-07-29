export interface Budget {
  id: string;
  number: string;
  client: string;
  responsible: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  total: number;
  items: BudgetItem[];
}

export interface BudgetItem {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BudgetFilters {
  budgetNumber?: string;
  client?: string;
  responsible?: string;
  startDate?: string;
  endDate?: string;
}

export interface BudgetFilterProps {
  filters: BudgetFilters;
  onFiltersChange: (filters: BudgetFilters) => void;
  clients: string[];
  responsibles: string[];
}
