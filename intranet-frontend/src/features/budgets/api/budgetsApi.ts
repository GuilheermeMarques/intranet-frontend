import budgetsMock from '@/mocks/budgets.json';
import productsMock from '@/mocks/products.json';
import representativesMock from '@/mocks/representatives.json';
import type { Budget, BudgetFilters, BudgetOption, BudgetsData } from '../types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const slugify = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

type RawBudgetItem = {
  id: string;
  product: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

type RawBudget = {
  id: string;
  number: string;
  client: string;
  responsible: string;
  createdAt: string;
  status: string;
  total: number;
  items: RawBudgetItem[];
};

function normalize(): Budget[] {
  return (budgetsMock.budgets as RawBudget[]).map((budget) => {
    const matchedRepresentative = representativesMock.representatives.find(
      (rep) => rep.name === budget.responsible,
    );

    return {
      id: budget.id,
      number: budget.number,
      clientId: `client-${slugify(budget.client)}`,
      clientName: budget.client,
      responsibleId: matchedRepresentative?.id ?? `representative-${slugify(budget.responsible)}`,
      responsibleName: budget.responsible,
      createdAt: budget.createdAt,
      status: budget.status as Budget['status'],
      total: budget.total,
      items: budget.items.map((item) => {
        const matchedProduct = productsMock.products.find(
          (product) =>
            product.name === item.product ||
            product.name.includes(item.product) ||
            item.product.includes(product.name),
        );

        return {
          id: item.id,
          productId: String(matchedProduct?.id ?? `product-${slugify(item.product)}`),
          productCode: matchedProduct?.code,
          productName: matchedProduct?.name ?? item.product,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          total: item.total,
        };
      }),
    };
  });
}

function deriveOptions(budgets: Budget[], pick: (b: Budget) => BudgetOption): BudgetOption[] {
  const map = new Map<string, BudgetOption>();
  budgets.forEach((b) => {
    const option = pick(b);
    map.set(option.value, option);
  });
  return Array.from(map.values()).sort((a, b) => a.label.localeCompare(b.label));
}

export const budgetsApi = {
  async list(filters?: Partial<BudgetFilters>): Promise<BudgetsData> {
    await delay(0);
    const all = normalize();
    let budgets = [...all];

    if (filters?.budgetNumber?.trim()) {
      const term = filters.budgetNumber.toLowerCase();
      budgets = budgets.filter((b) => b.number.toLowerCase().includes(term));
    }
    if (filters?.clientId?.trim()) {
      budgets = budgets.filter((b) => b.clientId === filters.clientId);
    }
    if (filters?.responsibleId?.trim()) {
      budgets = budgets.filter((b) => b.responsibleId === filters.responsibleId);
    }
    if (filters?.status) {
      budgets = budgets.filter((b) => b.status === filters.status);
    }
    if (filters?.startDate || filters?.endDate) {
      budgets = budgets.filter((b) => {
        const createdAt = new Date(b.createdAt);
        if (filters.startDate && createdAt < filters.startDate) return false;
        if (filters.endDate && createdAt > filters.endDate) return false;
        return true;
      });
    }

    const clients = deriveOptions(all, (b) => ({ value: b.clientId, label: b.clientName }));
    const responsibles = deriveOptions(all, (b) => ({
      value: b.responsibleId,
      label: b.responsibleName,
    }));
    const activeRepresentatives = representativesMock.representatives
      .filter((rep) => rep.status === 'active')
      .map((rep) => ({ value: rep.id, label: rep.name }));

    return { budgets, clients, responsibles, activeRepresentatives };
  },
};
