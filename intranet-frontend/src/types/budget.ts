export interface Budget {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  responsibleId: string;
  responsibleName: string;
  createdAt: string;
  validityDate?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  total: number;
  items: BudgetItem[];
}

export interface BudgetItem {
  id: string;
  productId: string | number;
  productCode?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface BudgetFilters {
  budgetNumber?: string;
  clientId?: string;
  responsibleId?: string;
  status?: Budget['status'] | '';
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface BudgetFilterProps {
  filters: BudgetFilters;
  onFiltersChange: (filters: BudgetFilters) => void;
  clients: Array<{ value: string; label: string }>;
  responsibles: Array<{ value: string; label: string }>;
}
