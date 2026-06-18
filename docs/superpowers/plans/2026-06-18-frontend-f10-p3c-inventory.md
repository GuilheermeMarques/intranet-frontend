# Frontend F10 Phase 3c (inventory) — Create movement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Wire `/inventory/new` to `POST /inventory/movements` (currently `console.log`), and source its product autocomplete + reasons dropdown from the API instead of mocks.

**Working dir:** `intranet-frontend/`. Branch `feat/frontend-f10-p3c-inventory`. npm. Backend running; dev server STOPPED while building. Gate: `npm test` + `npm run build`.

**Backend:** `POST /inventory/movements` `{productCode,description,quantity,type:'inbound'|'outbound',reason?,handledBy?,notes?}` → `{movement}`. `GET /inventory/lookups` → `{types,reasons}`. Products via `GET /products`.

---

## Task 1: inventory adapter writes + lookups + mutations
- [ ] Extend `src/features/inventory/api/inventoryApi.ts` (keep `list`):
```ts
export interface MovementInput {
  productCode: string
  description: string
  quantity: number
  type: 'inbound' | 'outbound'
  reason?: string
  handledBy?: string
  notes?: string
}
```
  add to the `inventoryApi` object:
```ts
  async create(data: MovementInput): Promise<InventoryMovement> {
    const { movement } = await httpClient.post<{ movement: InventoryMovement }>('/inventory/movements', data)
    return movement
  },
  async lookups(): Promise<{ types: string[]; reasons: string[] }> {
    return httpClient.get<{ types: string[]; reasons: string[] }>('/inventory/lookups')
  },
```
  (import `InventoryMovement` from `../types` if not already.)
- [ ] `src/features/inventory/hooks/useInventoryMutations.ts`:
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { inventoryApi, MovementInput } from '../api/inventoryApi'

export function useInventoryMutations() {
  const queryClient = useQueryClient()
  const create = useMutation({
    mutationFn: (data: MovementInput) => inventoryApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['inventory'] }),
  })
  return { create }
}
```
- [ ] `src/features/inventory/hooks/useInventoryLookupsQuery.ts`:
```ts
import { useQuery } from '@tanstack/react-query'
import { inventoryApi } from '../api/inventoryApi'

export function useInventoryLookupsQuery() {
  return useQuery({ queryKey: ['inventory-lookups'], queryFn: () => inventoryApi.lookups() })
}
```
- [ ] Extend `inventoryApi.test.ts`: assert `create` POSTs `/inventory/movements` + unwraps `.movement`; `lookups` GETs `/inventory/lookups`.
- [ ] Commit `feat(frontend): add inventory create mutation + lookups query`.

## Task 2: Wire the new-movement page
- [ ] In `src/app/inventory/new/page.tsx`: READ it first. Remove `import productsData from '@/mocks/products.json'` and `import inventoryData from '@/mocks/inventory.json'`. Import `useProductsQuery`, `useInventoryLookupsQuery`, `useInventoryMutations`.
  - Replace `const productOptions = productsData.products as Product[]` with `const { data: productOptions = [] } = useProductsQuery({ code: '', name: '', supplier: '' })`.
  - Replace the reasons source (`inventoryData.reasons`) with `const { data: lookups } = useInventoryLookupsQuery(); const reasons = lookups?.reasons ?? []` and use `reasons` in the reasons `<Select>`.
  - `const { create } = useInventoryMutations()`. Make `handleSubmit` async: `await create.mutateAsync(formData); router.push('/inventory')` (drop the `console.log`). Keep the cancel handler.
- [ ] Verify: `grep -n "@/mocks/products\|@/mocks/inventory\|console.log('Nova mov" src/app/inventory/new/page.tsx` → empty. `npx tsc --noEmit 2>&1 | grep "inventory/new/page.tsx"` → zero.
- [ ] Commit `refactor(frontend): wire new-movement page to POST /inventory/movements`.

## Task 3: Gate
- [ ] `npm run type-check` (pre-existing test noise only); `npm test -- --watchAll=false` (green); `npm run lint`; `npm run build` (SUCCESS). Commit any straggler.

---

## Done Criteria
- `/inventory/new` creates via `POST /inventory/movements`; product autocomplete + reasons come from the API; no `@/mocks/{products,inventory}` read in this page.
- `npm test` + `npm run build` green.
- (Controller validates via BFF: POST a movement, GET /inventory/movements shows it.)
