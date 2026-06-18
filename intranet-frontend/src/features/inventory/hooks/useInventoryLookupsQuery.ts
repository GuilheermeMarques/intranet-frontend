import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventoryApi'

export function useInventoryLookupsQuery() {
  return useQuery({ queryKey: ['inventory-lookups'], queryFn: () => inventoryApi.lookups() })
}
