export type BudgetStatus = 'pending' | 'approved' | 'rejected' | 'expired';

export interface BudgetItem {
  id: string;
  productId: string | number;
  productCode?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Budget {
  id: string;
  number: string;
  clientId: string;
  clientName: string;
  responsibleId: string;
  responsibleName: string;
  createdAt: string;
  validityDate?: string;
  status: BudgetStatus;
  total: number;
  items: BudgetItem[];
}

export interface BudgetFilters {
  budgetNumber?: string;
  clientId?: string;
  responsibleId?: string;
  status?: BudgetStatus | '';
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface BudgetOption {
  value: string;
  label: string;
}

export interface BudgetsData {
  budgets: Budget[];
  clients: BudgetOption[];
  responsibles: BudgetOption[];
  activeRepresentatives: BudgetOption[];
}
