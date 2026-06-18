# Frontend F10 Phase 3c (budgets) — New budget Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Wire the new-budget modal to `POST /budgets` (currently `console.log`), and source the item product-select from the API instead of the products mock.

**Working dir:** `intranet-frontend/`. Branch `feat/frontend-f10-p3c-budgets`. npm. Backend running; dev STOPPED while building. Gate: `npm test` + `npm run build`.

**Backend:** `POST /budgets` `{clientId, responsibleId, validityDate?, items:[{productId,quantity,unitPrice?}]}` → `{budget}` (resolves client/responsible/product snapshots, computes total, number `ORC-2025-###`). The budgets list adapter already supplies `clients`/`responsibles`/`activeRepresentatives` options (values are real UUIDs).

---

## Task 1: budgets adapter create + mutations
- [ ] Extend `src/features/budgets/api/budgetsApi.ts` (keep `list`):
```ts
export interface BudgetItemInput { productId: string; quantity: number; unitPrice?: number }
export interface BudgetInput {
  clientId: string
  responsibleId: string
  validityDate?: string
  items: BudgetItemInput[]
}
```
  add to the `budgetsApi` object:
```ts
  async create(data: BudgetInput): Promise<Budget> {
    const { budget } = await httpClient.post<{ budget: Budget }>('/budgets', data)
    return budget
  },
```
- [ ] `src/features/budgets/hooks/useBudgetMutations.ts`:
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { budgetsApi, BudgetInput } from '../api/budgetsApi'

export function useBudgetMutations() {
  const queryClient = useQueryClient()
  const create = useMutation({
    mutationFn: (data: BudgetInput) => budgetsApi.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['budgets'] }),
  })
  return { create }
}
```
- [ ] Extend `budgetsApi.test.ts`: assert `create` POSTs `/budgets`→`.budget` (add `post: jest.fn()` to the httpClient mock; the existing path-keyed `get` mock for `list` stays).
- [ ] Commit `feat(frontend): add budget create mutation`.

## Task 2: Wire the budgets page
READ `src/app/budgets/page.tsx`. It reads `productsData` in `handleItemChange` (find product by id → set code/name/unitPrice) AND in the item product-select `<MenuItem>` options. `handleCreateBudget` builds a `budgetToCreate` and `console.log`s it.
- [ ] Remove `import productsData from '@/mocks/products.json'`. Add `import { useProductsQuery } from '@/features/products/hooks/useProductsQuery'` + `import { useBudgetMutations } from '@/features/budgets/hooks/useBudgetMutations'`.
- [ ] `const { data: products = [] } = useProductsQuery({ code: '', name: '', supplier: '' })`. Replace BOTH `productsData.products` usages with `products` (the `handleItemChange` find — `products.find((p) => String(p.id) === value)` — and the select options map).
- [ ] `const { create } = useBudgetMutations()`. Rewrite `handleCreateBudget` async, keeping the existing validation (`alert` guards):
```tsx
const handleCreateBudget = async () => {
  if (!newBudget.clientId || !newBudget.responsibleId || newBudget.items.length === 0) {
    alert('Por favor, preencha todos os campos obrigatórios e adicione pelo menos um item.')
    return
  }
  if (newBudget.items.some((item) => !item.productId)) {
    alert('Por favor, selecione um produto para todos os itens.')
    return
  }
  await create.mutateAsync({
    clientId: newBudget.clientId,
    responsibleId: newBudget.responsibleId,
    validityDate: newBudget.validityDate || undefined,
    items: newBudget.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  })
  handleCloseNewBudgetModal()
}
```
  Remove the old `budgetToCreate`/`nextNumber`/`selectedClient`/`selectedRepresentative` construction + the `console.log`.
- [ ] Verify: `grep -n "@/mocks/products\|console.log('Novo or" src/app/budgets/page.tsx` → empty. `npx tsc --noEmit 2>&1 | grep "budgets/page.tsx"` → zero.
- [ ] Commit `refactor(frontend): wire new-budget modal to POST /budgets`.

## Task 3: Gate
- [ ] `npm run type-check` (pre-existing test noise only); `npm test -- --watchAll=false` (green); `npm run lint`; `npm run build` (SUCCESS). `grep -rn "@/mocks/products" src/app/budgets` → empty. Commit any straggler.

---

## Done Criteria
- New-budget modal persists via `POST /budgets`; the list refetches; item product-select from the API; no `@/mocks/products` read in the budgets page.
- `npm test` + `npm run build` green.
- (Controller validates via BFF: POST a budget with real clientId/responsibleId/productId, GET /budgets shows it with number ORC-2025-###.)

## Next
- tickets (create + messages + drag status + attachment); preferences + remove remaining mocks.
