# Frontend F10 Phase 3c (orders) — New order + status change Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Make the new-order form actually create orders via `POST /orders` (it currently has NO submit action — only client search + add-items), and make the order-detail status change persist via `PATCH /orders/:id/status`. Source client/product selects + detail from the API (drop mocks).

**Working dir:** `intranet-frontend/`. Branch `feat/frontend-f10-p3c-orders`. npm. Backend running; dev STOPPED while building. Gate: `npm test` + `npm run build`.

**Backend:** `POST /orders` `{clientId, items:[{productId,quantity,unitPrice?}], shippingCost?, notes?}` → `{order}` (resolves client/product snapshots, computes totals, code `PED-###`). `PATCH /orders/:id/status` `{status:'pending'|'shipped'|'delivered'|'canceled'}` → `{order}`. `GET /orders/:id` → `{order}`.

---

## Task 1: orders adapter writes + mutations + by-id query
- [ ] Extend `src/features/orders/api/ordersApi.ts` (keep `list` + `getById`):
```ts
export interface OrderItemInput { productId: string; quantity: number; unitPrice?: number }
export interface OrderInput {
  clientId: string
  items: OrderItemInput[]
  shippingCost?: number
  notes?: string
}
```
  add to the `ordersApi` object:
```ts
  async create(data: OrderInput): Promise<Order> {
    const { order } = await httpClient.post<{ order: Order }>('/orders', data)
    return order
  },
  async updateStatus(id: string, status: string): Promise<Order> {
    const { order } = await httpClient.patch<{ order: Order }>(`/orders/${id}/status`, { status })
    return order
  },
```
- [ ] `src/features/orders/hooks/useOrderMutations.ts`:
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, OrderInput } from '../api/ordersApi'

export function useOrderMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['orders'] })
  const create = useMutation({ mutationFn: (data: OrderInput) => ordersApi.create(data), onSuccess: invalidate })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ordersApi.updateStatus(id, status),
    onSuccess: (order) => {
      invalidate()
      queryClient.invalidateQueries({ queryKey: ['order', order.id] })
    },
  })
  return { create, updateStatus }
}
```
- [ ] `src/features/orders/hooks/useOrderByIdQuery.ts`:
```ts
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../api/ordersApi'

export function useOrderByIdQuery(id: string) {
  return useQuery({ queryKey: ['order', id], queryFn: () => ordersApi.getById(id), enabled: !!id })
}
```
- [ ] Extend `ordersApi.test.ts`: assert `create` POSTs `/orders`→`.order`; `updateStatus` PATCHes `/orders/:id/status` with `{status}`→`.order`.
- [ ] Commit `feat(frontend): add order create/updateStatus mutations + by-id query`.

## Task 2: NewOrderForm — selects from API + ADD create action
READ `src/app/sales/orders/new/components/NewOrderForm.tsx` fully. It has client search (`handleSearchClient`/`handleClientNameChange`) reading `clientsData`, product select reading `productsData`, `orderItems` state, `shippingCost`, but NO create/submit button.
- [ ] Remove `import clientsData from '@/mocks/clients.json'` + `import productsData from '@/mocks/products.json'`.
- [ ] Clients: `const { data: clientsData2 } = useClientsQuery({ code: '', name: '', city: '', startDate: null, endDate: null }); const clients = clientsData2?.clients ?? []`. Update `handleSearchClient`, `handleClientNameChange`, and the client-name options memo to use `clients` instead of the mock.
- [ ] Products: `const { data: products = [] } = useProductsQuery({ code: '', name: '', supplier: '' })`. Update the product-options memo to use `products`.
- [ ] Add `const router = useRouter()` (from `next/navigation`) if not present, and `const { create } = useOrderMutations()`.
- [ ] ADD a create handler + button. Handler:
```tsx
const handleCreateOrder = async () => {
  if (!selectedClient || orderItems.length === 0) return
  await create.mutateAsync({
    clientId: String(selectedClient.id),
    items: orderItems.map((item) => ({
      productId: String(item.productId),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    shippingCost: shippingCost ?? 0,
  })
  router.push('/sales/orders')
}
```
  Add a primary button near the order total/shipping footer of the items tab: `<Button variant="contained" disabled={!selectedClient || orderItems.length === 0 || create.isPending} onClick={handleCreateOrder}>Criar pedido</Button>`. Place it sensibly (e.g. after the totals summary). Keep all existing markup.
- [ ] NOTE: `selectedClient.id` must be the real client UUID. Since `selectedClient` now comes from `useClientsQuery` results (real `Client` with UUID `id`), this is correct.
- [ ] Verify: `grep -n "@/mocks/clients\|@/mocks/products" src/app/sales/orders/new/components/NewOrderForm.tsx` → empty. `npx tsc --noEmit 2>&1 | grep "NewOrderForm"` → zero.
- [ ] Commit `feat(frontend): wire new-order form to POST /orders (selects from API + create action)`.

## Task 3: OrderDetails — load from API + persist status
READ `src/app/sales/orders/[id]/OrderDetails.tsx`. It reads `ordersData`/`clientsData` mocks; `handleStatusUpdate` `console.log`s.
- [ ] Remove `import ordersData` + `import clientsData`. Import `useOrderByIdQuery` (orders) + `useClientByCodeQuery` (`@/features/clients/hooks/useClientByCodeQuery`) + `useOrderMutations`.
- [ ] Replace the `order` useMemo with `const { data: order, isLoading } = useOrderByIdQuery(orderId)`. Replace the client useMemo with `const { data: client } = useClientByCodeQuery(order?.clientCode ?? '')` (the hook is `enabled: !!code`).
- [ ] Loading: if `isLoading` → `<CircularProgress />`; if `!order` → keep/adapt the existing not-found rendering.
- [ ] `const { updateStatus } = useOrderMutations()`. Rewrite `handleStatusUpdate` async: `await updateStatus.mutateAsync({ id: orderId, status: newStatus }); /* close the status modal */` (drop console.log; `notes` is not part of the status endpoint — ignore it or leave the field cosmetic).
- [ ] Verify: `grep -n "@/mocks/orders\|@/mocks/clients" src/app/sales/orders/[id]/OrderDetails.tsx` → empty. `npx tsc --noEmit 2>&1 | grep "OrderDetails"` → zero.
- [ ] Commit `refactor(frontend): load order detail from API + persist status change`.

## Task 4: Gate
- [ ] `npm run type-check` (pre-existing test noise only); `npm test -- --watchAll=false` (green); `npm run lint`; `npm run build` (SUCCESS). `grep -rn "@/mocks/orders" src` → empty. Commit any straggler.

---

## Done Criteria
- New-order form creates via `POST /orders` (client/product selects from the API); order detail loads via `GET /orders/:id` + status persists via `PATCH /orders/:id/status`; no `@/mocks/orders` read.
- `npm test` + `npm run build` green.
- (Controller validates via BFF: POST an order, GET /orders shows it, PATCH status updates it.)

## Next
- budgets (new budget aggregate); tickets (create+messages+drag+attachment); preferences + remove remaining mocks.
