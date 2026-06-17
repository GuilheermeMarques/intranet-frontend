export type InventoryMovementType = 'inbound' | 'outbound';

export interface InventoryMovement {
  id: string;
  productCode: string;
  description: string;
  quantity: number;
  type: InventoryMovementType;
  occurredAt: string;
  reason?: string;
  handledBy?: string;
  notes?: string;
}

export interface InventoryFilters {
  productCode: string;
  description: string;
  type: string;
  startDate: Date | null;
  endDate: Date | null;
}

export interface InventoryData {
  movements: InventoryMovement[];
  types: string[];
  reasons: string[];
}
