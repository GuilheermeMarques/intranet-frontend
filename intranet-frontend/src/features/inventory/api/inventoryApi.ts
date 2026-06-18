import { httpClient } from '@/services/httpClient'
import type { InventoryFilters, InventoryData, InventoryMovement } from '../types'

export const inventoryApi = {
  async list(filters?: Partial<InventoryFilters>): Promise<InventoryData> {
    const [movementsRes, lookups] = await Promise.all([
      httpClient.get<{ movements: InventoryMovement[] }>('/inventory/movements', filters as Record<string, unknown> | undefined),
      httpClient.get<{ types: string[]; reasons: string[] }>('/inventory/lookups'),
    ])
    return { movements: movementsRes.movements, types: lookups.types, reasons: lookups.reasons }
  },
}
