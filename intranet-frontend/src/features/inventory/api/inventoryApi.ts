import inventoryMock from '@/mocks/inventory.json';
import type { InventoryMovement, InventoryFilters, InventoryData } from '../types';

const movements = inventoryMock.movements as InventoryMovement[];
const types = inventoryMock.types as string[];
const reasons = inventoryMock.reasons as string[];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const inventoryApi = {
  async list(filters?: Partial<InventoryFilters>): Promise<InventoryData> {
    await delay(0);
    let result = [...movements];

    if (filters?.productCode?.trim()) {
      const term = filters.productCode.toLowerCase();
      result = result.filter((m) => m.productCode.toLowerCase().includes(term));
    }
    if (filters?.description?.trim()) {
      const term = filters.description.toLowerCase();
      result = result.filter((m) => m.description.toLowerCase().includes(term));
    }
    if (filters?.type?.trim()) {
      result = result.filter((m) => m.type === filters.type);
    }
    if (filters?.startDate || filters?.endDate) {
      result = result.filter((m) => {
        const occurred = new Date(m.occurredAt);
        if (filters.startDate && occurred < filters.startDate) return false;
        if (filters.endDate && occurred > filters.endDate) return false;
        return true;
      });
    }

    return { movements: result, types, reasons };
  },
};
