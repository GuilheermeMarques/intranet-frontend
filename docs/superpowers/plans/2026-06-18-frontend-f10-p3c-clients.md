# Frontend F10 Phase 3c (clients) — Client create + detail wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Wire the clients "new client" modal to `POST /clients` (it currently only `console.log`s), and load the client-detail page from the API (`getByCode`) instead of the mock. First business-domain create flow.

**Architecture:** Add `create` to `clientsApi` + `useClientMutations` + `useClientByCodeQuery`. The clients list page's `handleSubmitNewClient` calls the create mutation (which invalidates `['clients']` → list refetches). `ClientDetails` loads the client via the query. NOTE: the client purchase-history tab reads `@/mocks/purchases.json` — there is NO backend endpoint for it, so it STAYS mock (documented gap); only the client data is wired.

**Tech Stack:** Next.js 15, TanStack React Query, MUI. npm. Backend running. Keep dev server STOPPED while building.

**Working dir:** `intranet-frontend/`. Branch `feat/frontend-f10-p3c-clients`. Gate: `npm test` + `npm run build`.

**Backend:** `POST /clients` `{name,document,zipCode,street,city,state,neighborhood,number,complement,email,phone,instagram}` → `{client}` (code auto-generated `CLI###`). `GET /clients/code/:code` → `{client}`.

---

## Task 1: clientsApi.create + mutations + by-code query
- [ ] Extend `src/features/clients/api/clientsApi.ts` (keep existing `list` + `getByCode`); add:
```ts
export interface ClientInput {
  name: string
  document: string
  zipCode: string
  street: string
  city: string
  state: string
  neighborhood: string
  number: string
  complement: string
  email: string
  phone: string
  instagram: string
}
```
  and a method (add to the `clientsApi` object):
```ts
  async create(data: ClientInput): Promise<Client> {
    const { client } = await httpClient.post<{ client: Client }>('/clients', data)
    return client
  },
```
  (ensure `httpClient` is imported — it already is.)
- [ ] Create `src/features/clients/hooks/useClientMutations.ts`:
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsApi, ClientInput } from '../api/clientsApi'

export function useClientMutations() {
  const queryClient = useQueryClient()
  const create = useMutation({
    mutationFn: (data: ClientInput) => clientsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })
  return { create }
}
```
- [ ] Create `src/features/clients/hooks/useClientByCodeQuery.ts`:
```ts
import { useQuery } from '@tanstack/react-query'
import { clientsApi } from '../api/clientsApi'

export function useClientByCodeQuery(code: string) {
  return useQuery({
    queryKey: ['client', code],
    queryFn: () => clientsApi.getByCode(code),
    enabled: !!code,
  })
}
```
- [ ] Extend `clientsApi.test.ts`: assert `create` POSTs `/clients` with the body and unwraps `.client`.
- [ ] Commit `feat(frontend): add client create mutation + by-code query`.

## Task 2: Wire the new-client modal
- [ ] In `src/app/clients/page.tsx`: import `useClientMutations`; `const { create } = useClientMutations()`. READ the file to find `handleSubmitNewClient` (currently `console.log('Novo cliente:', newClient)`) and the modal close + form reset (`setIsModalOpen(false)`/`setNewClient(...)`). Rewrite it:
```tsx
const handleSubmitNewClient = async () => {
  await create.mutateAsync(newClient)
  setIsModalOpen(false)
  setNewClient(/* the same initial NewClientForm object used in useState */)
}
```
  (`newClient` is a `NewClientForm` with exactly the `ClientInput` fields, so it can be passed directly. If TS complains, pass an explicit object mapping the 12 fields.) Keep the modal/form markup unchanged. Optionally guard against double-submit while `create.isPending` (nice-to-have).
- [ ] Verify: `grep -n "console.log('Novo cliente'" src/app/clients/page.tsx` → empty. `npx tsc --noEmit 2>&1 | grep "clients/page.tsx"` → zero.
- [ ] Commit `refactor(frontend): wire new-client modal to POST /clients`.

## Task 3: Load client detail from the API
- [ ] In `src/app/clients/[id]/ClientDetails.tsx`: remove `import clientsData from '@/mocks/clients.json'`. Add `import { useClientByCodeQuery } from '@/features/clients/hooks/useClientByCodeQuery'`. Replace the `currentClient` `useMemo` (which did `clientsData.clients.find((c) => c.code === clientId)`) with:
```tsx
const { data: currentClient, isLoading } = useClientByCodeQuery(clientId)
```
- [ ] Handle states: if `isLoading` → render a minimal `<CircularProgress />` (or the page's existing loading pattern); if `!currentClient` (after load) → keep/adapt the existing "not found" rendering. Everything downstream uses `currentClient` (now from the query) — keep it working (the type `Client` matches).
- [ ] KEEP `import purchasesData from '@/mocks/purchases.json'` and the purchases tab as-is (no backend endpoint). Leave a one-line `// TODO(F-later): client purchase history has no backend endpoint yet` comment near it.
- [ ] Verify: `grep -n "@/mocks/clients" src/app/clients/[id]/ClientDetails.tsx` → empty. `npx tsc --noEmit 2>&1 | grep "ClientDetails.tsx"` → zero.
- [ ] Commit `refactor(frontend): load client detail from the API (getByCode)`.

## Task 4: Gate
- [ ] `npm run type-check` (only pre-existing test-matcher noise); `npm test -- --watchAll=false` (green); `npm run lint` (no new errors); `npm run build` (SUCCESS — dev server stopped).
- [ ] Commit any straggler.

---

## Done Criteria
- New-client modal persists via `POST /clients`; the list refetches and shows the new client (code auto-assigned).
- Client detail loads via `GET /clients/code/:code` (no `@/mocks/clients` read).
- `npm test` + `npm run build` green.
- (Controller validates via BFF: POST /api/backend/clients creates + appears in GET /clients; GET /clients/code/:code returns it. Purchase-history tab still mock — documented.)

## Next (Phase 3c continued)
- products/catalog create+edit; inventory/new create; orders new+status; budgets new; tickets new+messages+drag+attachment; then preferences + remove remaining mocks.
