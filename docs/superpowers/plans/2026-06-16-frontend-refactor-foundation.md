# Frontend Refactor — Foundation (R0–R3 / clients vertical) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish a green safety net, delete the abandoned "clean architecture" dead-code island, and prove the lean data-layer pattern (English contracts + React Query + mock adapter) end-to-end on the `clients` vertical.

**Architecture:** Strategy B from the spec (`docs/superpowers/specs/2026-06-16-frontend-refactor-design.md`). The frontend gets a thin data layer: `features/<domain>/api` (mock async functions today, swappable for a real HTTP client at backend F10) + `features/<domain>/hooks` (React Query) + a single English `types.ts` per entity. Pages stop importing `@/mocks/*` directly. This plan covers R0, R1, and R2+R3 for `clients` only; products/inventory/orders/budgets/tickets and page decomposition (R4–R6) are sibling plans that replicate this pattern.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Material UI, TanStack React Query v5, Jest + React Testing Library, Cypress, knip.

**Working directory:** `intranet-frontend/`. All paths below are relative to it unless noted. Run all commands from `intranet-frontend/`.

---

## File Structure

**Created:**
- `knip.json` — dead-code detection config
- `src/app/providers/QueryProvider.tsx` — moved from `presentation/components`
- `src/app/providers/SessionProvider.tsx` — moved from `presentation/components`
- `src/features/auth/hooks/useAuth.ts` — moved from `presentation/hooks`
- `src/features/clients/types.ts` — single English `Client` contract
- `src/features/clients/api/clientsApi.ts` — mock data adapter (async)
- `src/features/clients/api/clientsApi.test.ts`
- `src/features/clients/hooks/useClientsQuery.ts` — React Query hooks
- `src/features/clients/hooks/useClientsQuery.test.tsx`

**Modified:**
- `src/app/layout.tsx` — provider import paths
- `src/app/login/page.tsx` — `useAuth` import path
- `src/mocks/clients.json` — English keys
- `src/app/clients/page.tsx` — consume hook + English fields
- `package.json` — remove `zustand`, add `knip`

**Deleted (the dead island):**
- `src/domain/**`
- `src/presentation/**` (after moving the 3 keepers)
- `src/infrastructure/services/api.ts`, `src/infrastructure/services/queryClient.ts`
- `src/infrastructure/storage/**`
- `src/middlewares/**` (empty)

---

## R0 — Safety Net

### Task 1: Capture green baseline

**Files:** none (verification only)

- [ ] **Step 1: Run unit tests and record the result**

Run: `npm test -- --watchAll=false`
Expected: PASS (record the number of passing suites/tests; if any fail, STOP and report — the baseline must be green before refactoring).

- [ ] **Step 2: Run the Cypress E2E suite**

Run: `npm run test:e2e`
Expected: PASS for `cypress/e2e/auth/login.cy.ts` and `cypress/e2e/clients/crud.cy.ts`. If the dev server is required, start it first with `npm run dev` in a separate shell. Record the result; this suite is the regression guard for every later task.

- [ ] **Step 3: Run type-check and lint**

Run: `npm run type-check && npm run lint`
Expected: no errors. Record any pre-existing warnings so later tasks don't get blamed for them.

### Task 2: Add knip for dead-code detection

**Files:**
- Create: `knip.json`
- Modify: `package.json`

- [ ] **Step 1: Install knip**

Run: `npm install --save-dev knip`
Expected: knip added to devDependencies.

- [ ] **Step 2: Create `knip.json`**

```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "entry": [
    "src/app/**/{page,layout,route,not-found,error,loading}.tsx",
    "src/app/**/route.ts",
    "src/middleware.ts",
    "jest.setup.js",
    "cypress.config.ts",
    "cypress/**/*.cy.ts"
  ],
  "project": ["src/**/*.{ts,tsx}"],
  "ignore": ["src/**/*.d.ts"],
  "ignoreDependencies": []
}
```

- [ ] **Step 3: Add a knip script to `package.json`**

In the `"scripts"` block, add:

```json
"knip": "knip"
```

- [ ] **Step 4: Run knip and capture the baseline report**

Run: `npm run knip`
Expected: knip lists unused files/exports/dependencies. Confirm the report includes `src/domain/...`, `src/presentation/...` (except the 3 keepers used by `layout.tsx`/`login`), `src/infrastructure/services/api.ts`, `src/infrastructure/storage/...`, and the `zustand` dependency. This report is the authority for Task 4's deletions — if a file you plan to delete is NOT listed by knip, investigate before deleting.

- [ ] **Step 5: Commit**

```bash
git add knip.json package.json package-lock.json
git commit -m "chore(frontend): add knip dead-code detection and capture baseline"
```

---

## R1 — Remove the Dead Island

### Task 3: Relocate the three live keepers out of `presentation/`

`QueryProvider` and `SessionProvider` are used by `app/layout.tsx`; `useAuth` is used by `app/login/page.tsx`. Move them to their target homes before deleting `presentation/`. (`SessionProvider`/`useAuth` still depend on `next-auth`; that dependency is removed later at backend F10, not here.)

**Files:**
- Create (via move): `src/app/providers/QueryProvider.tsx`, `src/app/providers/SessionProvider.tsx`, `src/features/auth/hooks/useAuth.ts`
- Modify: `src/app/layout.tsx`, `src/app/login/page.tsx`

- [ ] **Step 1: Move the three files with git**

```bash
mkdir -p src/app/providers src/features/auth/hooks
git mv src/presentation/components/QueryProvider.tsx src/app/providers/QueryProvider.tsx
git mv src/presentation/components/SessionProvider.tsx src/app/providers/SessionProvider.tsx
git mv src/presentation/hooks/useAuth.ts src/features/auth/hooks/useAuth.ts
```

- [ ] **Step 2: Update imports in `src/app/layout.tsx`**

Replace:

```tsx
import { QueryProvider } from '@/presentation/components/QueryProvider';
import { SessionProvider } from '@/presentation/components/SessionProvider';
```

with:

```tsx
import { QueryProvider } from '@/app/providers/QueryProvider';
import { SessionProvider } from '@/app/providers/SessionProvider';
```

- [ ] **Step 3: Update the import in `src/app/login/page.tsx`**

Replace:

```tsx
import { useAuth } from '@/presentation/hooks/useAuth';
```

with:

```tsx
import { useAuth } from '@/features/auth/hooks/useAuth';
```

- [ ] **Step 4: Verify nothing else references the old paths**

Run: `grep -rn "@/presentation\|@/domain\|infrastructure/services/api\|infrastructure/storage" src --include="*.ts" --include="*.tsx"`
Expected: zero matches. If any appear, they belong to the dead island being deleted in Task 4 — confirm the matching file is in the knip report.

- [ ] **Step 5: Type-check and run tests**

Run: `npm run type-check && npm test -- --watchAll=false`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(frontend): relocate QueryProvider, SessionProvider, useAuth out of presentation/"
```

### Task 4: Delete the dead island and remove the zustand dependency

**Files:**
- Delete: `src/domain/`, `src/presentation/`, `src/infrastructure/services/api.ts`, `src/infrastructure/services/queryClient.ts`, `src/infrastructure/storage/`, `src/middlewares/`
- Modify: `package.json`

- [ ] **Step 1: Delete the dead directories and files**

```bash
git rm -r src/domain
git rm -r src/presentation
git rm src/infrastructure/services/api.ts
git rm src/infrastructure/services/queryClient.ts
git rm -r src/infrastructure/storage
git rm -r src/middlewares 2>/dev/null || true
```

- [ ] **Step 2: Remove the unused zustand dependency**

Run: `npm uninstall zustand`
Expected: `zustand` removed from `package.json` dependencies.

- [ ] **Step 3: Confirm the deletions left no dangling imports**

Run: `npm run type-check`
Expected: no errors. If TypeScript reports a missing module, a live file still imported the dead code — restore just that file and re-evaluate (it was not truly orphaned).

- [ ] **Step 4: Re-run knip to confirm the island is gone**

Run: `npm run knip`
Expected: the previously listed `domain/`, `presentation/`, `infrastructure/services/api.ts`, `infrastructure/storage/` entries and the `zustand` dependency no longer appear.

- [ ] **Step 5: Run the full test + e2e safety net**

Run: `npm test -- --watchAll=false && npm run test:e2e`
Expected: PASS. Behavior is unchanged because deleted code was unused.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(frontend): delete abandoned clean-arch island (domain, presentation, mock api, stores)"
```

---

## R2 + R3 — Clients Vertical (English contract + data layer)

### Task 5: Define the single English `Client` contract

**Files:**
- Create: `src/features/clients/types.ts`

- [ ] **Step 1: Create the English type**

```ts
export interface Client {
  id: string;
  code: string;
  name: string;
  document: string;
  zipCode: string;
  street: string;
  city: string;
  state: string;
  neighborhood: string;
  number: string;
  complement: string;
  email: string;
  phone: string;
  instagram: string;
  lastPurchaseAt: string | null;
  purchaseCount: number;
}

export interface ClientFilters {
  code: string;
  name: string;
  city: string;
  startDate: Date | null;
  endDate: Date | null;
}

export interface ClientsData {
  clients: Client[];
  cities: string[];
}
```

- [ ] **Step 2: Type-check and commit**

```bash
npm run type-check
git add src/features/clients/types.ts
git commit -m "feat(frontend): add English Client contract in features/clients/types.ts"
```

### Task 6: Rename the clients mock to English keys

**Files:**
- Modify: `src/mocks/clients.json`

- [ ] **Step 1: Rewrite every client object key from Portuguese to English**

Apply this exact key mapping to every object in the `clients` array of `src/mocks/clients.json`, and add an `id` equal to the `code` value for each entry:

`codigo→code, nome→name, cpf→document, cep→zipCode, endereco→street, cidade→city, estado→state, bairro→neighborhood, numero→number, complemento→complement, email→email, telefone→phone, instagram→instagram, dataUltimaCompra→lastPurchaseAt, quantidadeCompras→purchaseCount`.

Example — the first object becomes:

```json
{
  "id": "CLI001",
  "code": "CLI001",
  "name": "João Silva",
  "document": "123.456.789-00",
  "zipCode": "01234-567",
  "street": "Rua das Flores",
  "city": "São Paulo",
  "state": "SP",
  "neighborhood": "Centro",
  "number": "123",
  "complement": "Apto 45",
  "email": "joao.silva@email.com",
  "phone": "(11) 99999-9999",
  "instagram": "@joao_silva",
  "lastPurchaseAt": "2024-01-15",
  "purchaseCount": 12
}
```

If the file has a top-level `cidades` array, rename it to `cities`. If it does not, leave the file with only the `clients` array — Task 7 derives cities from the client list.

- [ ] **Step 2: Validate the JSON parses**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/mocks/clients.json','utf8')); console.log('ok')"`
Expected: prints `ok`.

- [ ] **Step 3: Commit**

```bash
git add src/mocks/clients.json
git commit -m "refactor(frontend): rename clients mock keys to English"
```

### Task 7: Build the clients mock API adapter (TDD)

**Files:**
- Create: `src/features/clients/api/clientsApi.ts`
- Test: `src/features/clients/api/clientsApi.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { clientsApi } from './clientsApi';

describe('clientsApi', () => {
  it('returns all clients when no filters are given', async () => {
    const result = await clientsApi.list();
    expect(result.clients.length).toBeGreaterThan(0);
    expect(result.clients[0]).toHaveProperty('code');
    expect(result.clients[0]).toHaveProperty('name');
  });

  it('derives a deduplicated, sorted list of cities', async () => {
    const { cities } = await clientsApi.list();
    expect(cities).toEqual([...new Set(cities)].sort());
  });

  it('filters by code (case-insensitive, partial)', async () => {
    const { clients } = await clientsApi.list({ code: 'cli001' });
    expect(clients.every((c) => c.code.toLowerCase().includes('cli001'))).toBe(true);
  });

  it('filters by exact city', async () => {
    const all = await clientsApi.list();
    const city = all.clients[0].city;
    const { clients } = await clientsApi.list({ city });
    expect(clients.every((c) => c.city === city)).toBe(true);
  });

  it('returns a single client by code', async () => {
    const all = await clientsApi.list();
    const code = all.clients[0].code;
    const client = await clientsApi.getByCode(code);
    expect(client?.code).toBe(code);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/features/clients/api/clientsApi.test.ts --watchAll=false`
Expected: FAIL with "Cannot find module './clientsApi'".

- [ ] **Step 3: Write the adapter**

```ts
import clientsMock from '@/mocks/clients.json';
import type { Client, ClientFilters, ClientsData } from '../types';

const clients = clientsMock.clients as Client[];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function deriveCities(list: Client[]): string[] {
  return [...new Set(list.map((c) => c.city))].sort();
}

export const clientsApi = {
  async list(filters?: Partial<ClientFilters>): Promise<ClientsData> {
    await delay(0);
    let result = [...clients];

    if (filters?.code?.trim()) {
      const term = filters.code.toLowerCase();
      result = result.filter((c) => c.code.toLowerCase().includes(term));
    }
    if (filters?.name?.trim()) {
      const term = filters.name.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(term));
    }
    if (filters?.city?.trim()) {
      result = result.filter((c) => c.city === filters.city);
    }

    return { clients: result, cities: deriveCities(clients) };
  },

  async getByCode(code: string): Promise<Client | null> {
    await delay(0);
    return clients.find((c) => c.code === code) ?? null;
  },
};
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/features/clients/api/clientsApi.test.ts --watchAll=false`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/clients/api/clientsApi.ts src/features/clients/api/clientsApi.test.ts
git commit -m "feat(frontend): add clients mock API adapter with filter logic"
```

### Task 8: Build the React Query hook (TDD)

**Files:**
- Create: `src/features/clients/hooks/useClientsQuery.ts`
- Test: `src/features/clients/hooks/useClientsQuery.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useClientsQuery } from './useClientsQuery';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useClientsQuery', () => {
  it('loads clients and cities through the api adapter', async () => {
    const { result } = renderHook(() => useClientsQuery({ code: '', name: '', city: '', startDate: null, endDate: null }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.clients.length).toBeGreaterThan(0);
    expect(Array.isArray(result.current.data?.cities)).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- src/features/clients/hooks/useClientsQuery.test.tsx --watchAll=false`
Expected: FAIL with "Cannot find module './useClientsQuery'".

- [ ] **Step 3: Write the hook**

```ts
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '../api/clientsApi';
import type { ClientFilters } from '../types';

export function useClientsQuery(filters: ClientFilters) {
  return useQuery({
    queryKey: ['clients', filters.code, filters.name, filters.city],
    queryFn: () => clientsApi.list(filters),
  });
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- src/features/clients/hooks/useClientsQuery.test.tsx --watchAll=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/clients/hooks/useClientsQuery.ts src/features/clients/hooks/useClientsQuery.test.tsx
git commit -m "feat(frontend): add useClientsQuery React Query hook"
```

### Task 9: Rewire `app/clients/page.tsx` to the hook and English fields

The list page currently imports `clientsData from '@/mocks/clients.json'`, types from `@/types/client`, and references `codigo`/`nome`/`cidade`/`cidades` directly. Switch it to the new feature module and English field names. The page stays a list page (full decomposition is a sibling R4 plan); this task only swaps the data source and field names so behavior is identical.

**Files:**
- Modify: `src/app/clients/page.tsx`

- [ ] **Step 1: Replace the data + type imports**

Replace:

```tsx
import clientsData from '@/mocks/clients.json';
import { Client, ClientFilters } from '@/types/client';
```

with:

```tsx
import { useClientsQuery } from '@/features/clients/hooks/useClientsQuery';
import { Client, ClientFilters } from '@/features/clients/types';
```

- [ ] **Step 2: Replace the direct-mock filtering with the hook**

Find the `useMemo` block (around lines 138–154) that filters `clientsData.clients`:

```tsx
const filteredClients = useMemo(() => {
  return (clientsData.clients as Client[]).filter((client) => {
    const matchesCodigo =
      !filters.codigo ||
      filters.codigo.trim() === '' ||
      client.codigo.toLowerCase().includes(filters.codigo.toLowerCase());
    const matchesNome =
      !filters.nome ||
      filters.nome.trim() === '' ||
      client.nome.toLowerCase().includes(filters.nome.toLowerCase());
    const matchesCidade =
      !filters.cidade || filters.cidade.trim() === '' || client.cidade === filters.cidade;
    return matchesCodigo && matchesNome && matchesCidade;
  });
}, [filters]);
```

Replace the entire block with a hook call (the adapter already does the filtering):

```tsx
const { data, isLoading } = useClientsQuery(filters);
const filteredClients = data?.clients ?? [];
const cities = data?.cities ?? [];
```

- [ ] **Step 3: Rename every Portuguese field/filter reference to English in this file**

Apply across `src/app/clients/page.tsx`: `filters.codigo→filters.code`, `filters.nome→filters.name`, `filters.cidade→filters.city`; the `ClientFilters` initial `useState` keys `codigo/nome/cidade` → `code/name/city`; `row.codigo→row.code`; `client.codigo/nome/cidade→client.code/name/city`; in the new-client form and table, `newClient.nome→newClient.name`, `newClient.cidade→newClient.city` (and any other PT field names from the Task 5 mapping that appear). Replace the two `clientsData.cidades as string[]` references (filter options ~line 285 and the select ~line 427) with the `cities` variable from Step 2. Update the `NewClientForm` interface and its `useState` initializer to the English field names.

- [ ] **Step 4: Show a loading state while the query is pending**

Where the table is rendered, gate it with the `isLoading` flag, e.g. render `<DataTable ... />` only when `!isLoading` and otherwise show the existing/placeholder spinner. Keep it minimal — a single conditional. (Standardized loading/empty/error states are R6.)

- [ ] **Step 5: Verify no Portuguese field names or direct mock import remain**

Run: `grep -n "codigo\|nome\|cidade\|cidades\|@/mocks/clients\|@/types/client" src/app/clients/page.tsx`
Expected: zero matches.

- [ ] **Step 6: Type-check, lint, unit tests**

Run: `npm run type-check && npm run lint && npm test -- --watchAll=false`
Expected: PASS.

- [ ] **Step 7: Run the clients E2E regression**

Run: `npm run test:e2e -- --spec cypress/e2e/clients/crud.cy.ts`
Expected: PASS. If the spec asserts on Portuguese-labeled UI text it should still pass (only field/data wiring changed, not visible labels). If it asserts on a mock data key, update the spec fixture/assertion to the English key and re-run.

- [ ] **Step 8: Commit**

```bash
git add src/app/clients/page.tsx cypress/e2e/clients/crud.cy.ts
git commit -m "refactor(frontend): wire clients list page to React Query + English Client contract"
```

### Task 10: Migrate remaining `@/types/client` consumers, then remove the old type

**Files:**
- Modify: any remaining files importing `@/types/client`
- Delete: `src/types/client.ts`

- [ ] **Step 1: Find remaining consumers of the old type**

Run: `grep -rln "@/types/client" src --include="*.ts" --include="*.tsx"`
Expected: a list (e.g. `app/clients/[id]/ClientDetails.tsx`). If the list is empty, skip to Step 3.

- [ ] **Step 2: Repoint each consumer to the feature type**

In each file from Step 1, replace `import ... from '@/types/client'` with the matching import from `@/features/clients/types`, and rename any Portuguese field references it uses to English per the Task 5 mapping. Run `npm run type-check` after each file until clean.

- [ ] **Step 3: Delete the obsolete type file**

```bash
git rm src/types/client.ts
```

- [ ] **Step 4: Verify and run the safety net**

Run: `npm run type-check && npm test -- --watchAll=false && npm run knip`
Expected: type-check PASS, tests PASS, and knip no longer lists `src/types/client.ts`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(frontend): remove legacy @/types/client; clients fully on English contract"
```

---

## Done Criteria (this plan)

- `npm run knip` reports no `domain/`, `presentation/`, mock-`api.ts`, `infrastructure/storage/`, or `zustand` usage.
- `src/app/clients/page.tsx` imports no `@/mocks/*` and no Portuguese field names; data flows through `useClientsQuery`.
- `src/features/clients/` holds the English `Client` contract, mock API adapter, and React Query hook, each with passing tests.
- Full Jest + Cypress suites green; clients list behaves identically to before.

## Follow-up Plans (not in scope here)

1. **Clients decomposition (R4):** split the remaining list/form/filter logic of `app/clients/page.tsx` into `features/clients/components`.
2. **Per-entity verticals (R2+R3):** repeat Tasks 5–10 for `products`, `inventory`, `representatives`, `orders`, `budgets`.
3. **Tickets vertical + decomposition:** highest effort (`app/tickets/page.tsx` is 1366 lines, `@dnd-kit` kanban) — its own plan.
4. **Settings/permissions (R3):** move off `localStorage` to a `permissions` feature module.
5. **Providers & shared UI (R5) and loading/empty/error states (R6).**
