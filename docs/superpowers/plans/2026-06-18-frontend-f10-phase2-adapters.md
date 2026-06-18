# Frontend F10 Phase 2 — Feature Adapters mock→httpClient Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Swap every `features/<domain>/api/*Api.ts` adapter from reading `@/mocks/*` to calling the real backend via `@/services/httpClient` (the BFF proxy from Phase 1). All list/detail pages then render real data. The backend already filters server-side and returns the exact frontend contracts.

**Architecture:** Adapters become thin passthroughs: `httpClient.get('/clients', filters)` etc. Backend response envelopes are unwrapped to the shape the hooks already expect. Three adapters assemble data from multiple endpoints (inventory, budgets, tickets). Tests are updated to mock `@/services/httpClient` (adapter tests) or the adapter module (hook tests) — no network in jsdom.

**Tech Stack:** Next.js 15, TanStack React Query, Jest + RTL. Package manager **npm**. Backend running at the BFF (`/api/backend/*`).

**Working dir:** `intranet-frontend/`. Branch `feat/frontend-f10-adapters`. Gate: `npm test` + `npm run build`. Runtime validation via `/api/backend/*` with both servers up (done by controller after each dispatch).

**httpClient API (from Phase 1):** `httpClient.get<T>(path, params?)`, `.post/.patch/.put<T>(path, body?)`, `.delete<T>(path)`. `ApiError { status }` thrown on non-2xx. Import: `import { httpClient, ApiError } from '@/services/httpClient'`.

**Backend endpoint → frontend shape map:**
| adapter method | backend | unwrap |
|---|---|---|
| clientsApi.list(filters) | GET /clients?{code,name,city,startDate,endDate} | `{clients,cities}` (as-is) |
| clientsApi.getByCode(code) | GET /clients/code/:code | `.client` (404→null) |
| productsApi.list(filters) | GET /products?{code,name,category,supplier} | `.products` |
| productsApi.getById(id) | GET /products/:id | `.product` (404→null) |
| inventoryApi.list(filters) | GET /inventory/movements?{…} + GET /inventory/lookups | assemble `{movements,types,reasons}` |
| representativesApi.list(filters) | GET /representatives?{name,region,status} | `{representatives,regions,statusOptions}` (as-is) |
| ordersApi.list(filters) | GET /orders?{orderCode,clientName,status} | `.orders` |
| ordersApi.getById(id) | GET /orders/:id | `.order` (404→null) |
| budgetsApi.list(filters) | GET /budgets?{…} + GET /clients + GET /representatives | assemble `{budgets,clients,responsibles,activeRepresentatives}` |
| prioritiesApi.list() | GET /ticket-priorities | `.priorities` |
| tagsApi.list() | GET /ticket-tags | `.tags` |
| ticketsApi.list() | GET /tickets | `{tickets, statusConfig}` (statusConfig = local const) |
| dashboardApi.getSummary() | GET /dashboard/summary | as-is `{stats,progress,recentActivity}` |

---

## PART 1 — Clean adapters (clients, products, orders, representatives, priorities, tags, dashboard)

For EACH domain below: (a) rewrite the adapter, (b) rewrite its `*.test.ts` to mock `@/services/httpClient`, (c) rewrite its hook `*.test.tsx` to mock the adapter module. Keep imports/exports/return types identical to today so the hooks/pages are unchanged.

### Task 1: clients
- [ ] Rewrite `src/features/clients/api/clientsApi.ts`:
```ts
import { httpClient, ApiError } from '@/services/httpClient'
import type { Client, ClientFilters, ClientsData } from '../types'

export const clientsApi = {
  async list(filters?: Partial<ClientFilters>): Promise<ClientsData> {
    return httpClient.get<ClientsData>('/clients', filters as Record<string, unknown> | undefined)
  },

  async getByCode(code: string): Promise<Client | null> {
    try {
      const { client } = await httpClient.get<{ client: Client }>(`/clients/code/${code}`)
      return client
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },
}
```
- [ ] Rewrite `src/features/clients/api/clientsApi.test.ts` (mock httpClient):
```ts
import { clientsApi } from './clientsApi'
import { httpClient, ApiError } from '@/services/httpClient'

jest.mock('@/services/httpClient', () => {
  const actual = jest.requireActual('@/services/httpClient')
  return { ...actual, httpClient: { get: jest.fn() } }
})

const mockGet = httpClient.get as jest.Mock

describe('clientsApi', () => {
  beforeEach(() => mockGet.mockReset())

  it('list() calls GET /clients with filters and returns ClientsData', async () => {
    mockGet.mockResolvedValue({ clients: [{ code: 'CLI001' }], cities: ['SP'] })
    const result = await clientsApi.list({ name: 'jo' })
    expect(mockGet).toHaveBeenCalledWith('/clients', { name: 'jo' })
    expect(result.clients).toHaveLength(1)
    expect(result.cities).toEqual(['SP'])
  })

  it('getByCode() unwraps {client}', async () => {
    mockGet.mockResolvedValue({ client: { code: 'CLI001' } })
    const c = await clientsApi.getByCode('CLI001')
    expect(mockGet).toHaveBeenCalledWith('/clients/code/CLI001')
    expect(c?.code).toBe('CLI001')
  })

  it('getByCode() returns null on 404', async () => {
    mockGet.mockRejectedValue(new ApiError(404, 'not found'))
    expect(await clientsApi.getByCode('X')).toBeNull()
  })
})
```
- [ ] Rewrite `src/features/clients/hooks/useClientsQuery.test.tsx` to mock the adapter:
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { ReactNode } from 'react'
import { useClientsQuery } from './useClientsQuery'
import { clientsApi } from '../api/clientsApi'

jest.mock('../api/clientsApi', () => ({ clientsApi: { list: jest.fn() } }))

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

describe('useClientsQuery', () => {
  it('returns data from the adapter', async () => {
    ;(clientsApi.list as jest.Mock).mockResolvedValue({ clients: [{ code: 'CLI001' }], cities: ['SP'] })
    const { result } = renderHook(
      () => useClientsQuery({ code: '', name: '', city: '', startDate: null, endDate: null }),
      { wrapper },
    )
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.clients).toHaveLength(1)
  })
})
```
- [ ] `npm test -- clients` green. Commit `refactor(frontend): wire clientsApi to backend via httpClient`.

### Task 2: products
- [ ] `productsApi.ts`:
```ts
import { httpClient, ApiError } from '@/services/httpClient'
import type { Product, ProductFilters } from '../types'

export const productsApi = {
  async list(filters?: Partial<ProductFilters>): Promise<Product[]> {
    const { products } = await httpClient.get<{ products: Product[] }>('/products', filters as Record<string, unknown> | undefined)
    return products
  },
  async getById(id: string | number): Promise<Product | null> {
    try {
      const { product } = await httpClient.get<{ product: Product }>(`/products/${id}`)
      return product
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },
}
```
- [ ] Update `productsApi.test.ts` (mock httpClient: list returns `{products:[...]}`, assert `.products`; getById unwraps `.product`; 404→null) and `useProductsQuery.test.tsx` (mock adapter). `npm test -- products` green. Commit `refactor(frontend): wire productsApi to backend`.

### Task 3: orders
- [ ] `ordersApi.ts`:
```ts
import { httpClient, ApiError } from '@/services/httpClient'
import type { Order, OrderFilters } from '../types'

export const ordersApi = {
  async list(filters?: Partial<OrderFilters>): Promise<Order[]> {
    const { orders } = await httpClient.get<{ orders: Order[] }>('/orders', filters as Record<string, unknown> | undefined)
    return orders
  },
  async getById(id: string): Promise<Order | null> {
    try {
      const { order } = await httpClient.get<{ order: Order }>(`/orders/${id}`)
      return order
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) return null
      throw error
    }
  },
}
```
- [ ] Update tests analogously. `npm test -- orders` green. Commit `refactor(frontend): wire ordersApi to backend`.

### Task 4: representatives
- [ ] `representativesApi.ts`:
```ts
import { httpClient } from '@/services/httpClient'
import type { RepresentativeFilters, RepresentativesData } from '../types'

export const representativesApi = {
  async list(filters?: Partial<RepresentativeFilters>): Promise<RepresentativesData> {
    return httpClient.get<RepresentativesData>('/representatives', filters as Record<string, unknown> | undefined)
  },
}
```
- [ ] Update tests (list returns RepresentativesData as-is). Commit `refactor(frontend): wire representativesApi to backend`.

### Task 5: priorities + tags + dashboard
- [ ] `tickets/api/prioritiesApi.ts`:
```ts
import { httpClient } from '@/services/httpClient'
import type { Priority } from '../types'

export const prioritiesApi = {
  async list(): Promise<Priority[]> {
    const { priorities } = await httpClient.get<{ priorities: Priority[] }>('/ticket-priorities')
    return priorities
  },
}
```
- [ ] `tickets/api/tagsApi.ts`:
```ts
import { httpClient } from '@/services/httpClient'
import type { Tag } from '../types'

export const tagsApi = {
  async list(): Promise<Tag[]> {
    const { tags } = await httpClient.get<{ tags: Tag[] }>('/ticket-tags')
    return tags
  },
}
```
- [ ] `dashboard/api/dashboardApi.ts`:
```ts
import { httpClient } from '@/services/httpClient'
import type { DashboardSummary } from '../types'

export const dashboardApi = {
  async getSummary(): Promise<DashboardSummary> {
    return httpClient.get<DashboardSummary>('/dashboard/summary')
  },
}
```
- [ ] Update the 3 adapter tests (mock httpClient) + 3 hook tests (`usePrioritiesQuery`, `useTagsQuery`, `useDashboardQuery` — mock adapter). `npm test` green. Commit `refactor(frontend): wire priorities/tags/dashboard adapters to backend`.

---

## PART 2 — Assembling adapters (inventory, budgets, tickets)

### Task 6: inventory (movements + lookups)
- [ ] `inventory/api/inventoryApi.ts`:
```ts
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
```
- [ ] Update `inventoryApi.test.ts` (mock httpClient with two resolved values keyed by path — `mockGet.mockImplementation((p) => p === '/inventory/lookups' ? Promise.resolve({types:['inbound','outbound'],reasons:['x']}) : Promise.resolve({movements:[{id:'1'}]}))`; assert assembled shape) + `useInventoryQuery.test.tsx` (mock adapter). Commit `refactor(frontend): wire inventoryApi to backend (movements + lookups)`.

### Task 7: budgets (budgets + clients + representatives → options)
- [ ] `budgets/api/budgetsApi.ts`:
```ts
import { httpClient } from '@/services/httpClient'
import type { Budget, BudgetFilters, BudgetOption, BudgetsData } from '../types'

interface RawClient { id: string; name: string }
interface RawRepresentative { id: string; name: string; status: string }

export const budgetsApi = {
  async list(filters?: Partial<BudgetFilters>): Promise<BudgetsData> {
    const [budgetsRes, clientsRes, repsRes] = await Promise.all([
      httpClient.get<{ budgets: Budget[] }>('/budgets', filters as Record<string, unknown> | undefined),
      httpClient.get<{ clients: RawClient[] }>('/clients'),
      httpClient.get<{ representatives: RawRepresentative[] }>('/representatives'),
    ])

    const budgets = budgetsRes.budgets

    const clients: BudgetOption[] = clientsRes.clients
      .map((c) => ({ value: c.id, label: c.name }))
      .sort((a, b) => a.label.localeCompare(b.label))

    const responsibles: BudgetOption[] = Array.from(
      new Map(budgets.map((b) => [b.responsibleId, { value: b.responsibleId, label: b.responsibleName }])).values(),
    ).sort((a, b) => a.label.localeCompare(b.label))

    const activeRepresentatives: BudgetOption[] = repsRes.representatives
      .filter((r) => r.status === 'active')
      .map((r) => ({ value: r.id, label: r.name }))

    return { budgets, clients, responsibles, activeRepresentatives }
  },
}
```
- [ ] Update `budgetsApi.test.ts` (mock httpClient with path-keyed mockImplementation returning `{budgets}`, `{clients}`, `{representatives}`; assert assembled options) + `useBudgetsQuery.test.tsx` (mock adapter). Commit `refactor(frontend): wire budgetsApi to backend (budgets + option lookups)`.

### Task 8: tickets (tickets + local statusConfig)
- [ ] `tickets/api/ticketsApi.ts` (keep the existing `TicketsData` type export; move statusConfig to a local const):
```ts
import { httpClient } from '@/services/httpClient'
import type { Ticket } from '../types'

const statusConfig = {
  todo: { label: 'ToDo', color: '#ff9800' },
  inProgress: { label: 'InProgress', color: '#2196f3' },
  inReview: { label: 'In Review', color: '#9c27b0' },
  done: { label: 'Done', color: '#4caf50' },
}

export interface TicketsData {
  tickets: Ticket[]
  statusConfig: typeof statusConfig
}

export const ticketsApi = {
  async list(): Promise<TicketsData> {
    const { tickets } = await httpClient.get<{ tickets: Ticket[] }>('/tickets')
    return { tickets, statusConfig }
  },
}
```
  (If the page imports `TicketsData` from elsewhere, keep the export location identical to today — inspect the current file first.)
- [ ] Update `ticketsApi.test.ts` (mock httpClient returning `{tickets:[...]}`; assert `.statusConfig` present + tickets) + `useTicketsQuery.test.tsx` (mock adapter). Commit `refactor(frontend): wire ticketsApi to backend (+ local statusConfig)`.

---

## Task 9: Gate
- [ ] `npm run type-check` → clean (only pre-existing `*.test.*` matcher noise).
- [ ] `npm test -- --watchAll=false` → all green (adapter + hook tests updated; no mock-JSON reads remain in adapters).
- [ ] `grep -rln "@/mocks/" src/features` → EMPTY (no feature adapter reads a mock anymore).
- [ ] `npm run lint` → no new errors. `npm run build` → SUCCESS.
- [ ] Commit any stragglers.

---

## Done Criteria
- All 10 feature adapters call the backend via `httpClient`; no `@/mocks/*` import remains under `src/features`.
- Adapter + hook tests updated (mock httpClient / mock adapter), suite green; `npm run build` green.
- (Controller validates each domain end-to-end via `/api/backend/*` with both servers running.)

## Next (F10 Phase 3)
- Writes: create/edit/delete wired from the pages' modals to the API (clients, products, orders, budgets, tickets, priorities, tags) via new adapter methods + React Query mutations.
- Permissions admin: `/settings/permissions` → GET /users, GET/PUT /users/:id/permissions; preferences via API.
- Remove `src/mocks/*` and any remaining legacy types.
