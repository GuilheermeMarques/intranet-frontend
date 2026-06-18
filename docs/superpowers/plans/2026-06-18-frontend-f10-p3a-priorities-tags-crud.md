# Frontend F10 Phase 3a — Priorities + Tags CRUD (writes) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Wire the ticket-priorities and ticket-tags admin pages' create/edit/delete to the real backend via React Query mutations. Establishes the write/mutation pattern (`httpClient.post/patch/delete` + `useMutation` + query invalidation) that the rest of Phase 3 follows.

**Architecture:** Add `create/update/remove` to `prioritiesApi`/`tagsApi`; add a mutations hook per domain that invalidates the list query on success. The pages already hold local state seeded from the list query via `useEffect`; mutations invalidate → query refetches → `useEffect` re-syncs. Page handlers (`handleSave`/`handleDelete`) become async calls to the mutations (drop the optimistic local-state writes).

**Backend:** `POST /ticket-priorities` `{name,color,level,description?,isActive?}` → `{priority}`; `PATCH /ticket-priorities/:id` `{partial}` → `{priority}`; `DELETE /ticket-priorities/:id` → 204. Same for `/ticket-tags`.

**Tech Stack:** Next.js 15, TanStack React Query, MUI. npm. Backend running at `/api/backend/*`.

**Working dir:** `intranet-frontend/`. Branch `feat/frontend-f10-p3a-crud`. Gate: `npm test` + `npm run build`.

---

## Task 1: Priorities — adapter writes + mutations hook
- [ ] Extend `src/features/tickets/api/prioritiesApi.ts` (keep existing `list`):
```ts
import { httpClient } from '@/services/httpClient'
import type { Priority } from '../types'

export interface PriorityInput {
  name: string
  color: string
  level: number
  description?: string
  isActive?: boolean
}

export const prioritiesApi = {
  async list(): Promise<Priority[]> {
    const { priorities } = await httpClient.get<{ priorities: Priority[] }>('/ticket-priorities')
    return priorities
  },
  async create(data: PriorityInput): Promise<Priority> {
    const { priority } = await httpClient.post<{ priority: Priority }>('/ticket-priorities', data)
    return priority
  },
  async update(id: string, data: Partial<PriorityInput>): Promise<Priority> {
    const { priority } = await httpClient.patch<{ priority: Priority }>(`/ticket-priorities/${id}`, data)
    return priority
  },
  async remove(id: string): Promise<void> {
    await httpClient.delete(`/ticket-priorities/${id}`)
  },
}
```
- [ ] Create `src/features/tickets/hooks/usePriorityMutations.ts`:
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { prioritiesApi, PriorityInput } from '../api/prioritiesApi'

export function usePriorityMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['ticket-priorities'] })

  const create = useMutation({ mutationFn: (data: PriorityInput) => prioritiesApi.create(data), onSuccess: invalidate })
  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PriorityInput> }) => prioritiesApi.update(id, data),
    onSuccess: invalidate,
  })
  const remove = useMutation({ mutationFn: (id: string) => prioritiesApi.remove(id), onSuccess: invalidate })

  return { create, update, remove }
}
```
- [ ] Adapter test `prioritiesApi.test.ts`: mock httpClient; assert `create` posts to `/ticket-priorities` and unwraps `.priority`; `update` patches `/ticket-priorities/:id`; `remove` deletes. (Keep/extend the existing `list` test.)
- [ ] Commit `feat(frontend): add priorities write adapter + mutations`.

## Task 2: Tags — adapter writes + mutations hook
- [ ] Extend `src/features/tickets/api/tagsApi.ts` analogously: `TagInput { name; color; description?; category?; isActive? }`; `create`→`POST /ticket-tags`→`.tag`; `update`→`PATCH /ticket-tags/:id`; `remove`→`DELETE /ticket-tags/:id`.
- [ ] Create `src/features/tickets/hooks/useTagMutations.ts` (queryKey `['ticket-tags']`).
- [ ] Adapter test `tagsApi.test.ts`: assert create/update/remove paths.
- [ ] Commit `feat(frontend): add tags write adapter + mutations`.

## Task 3: Rewire priorities page
- [ ] In `src/app/tickets/priorities/page.tsx`:
  - Import `usePriorityMutations`; `const { create, update, remove } = usePriorityMutations()`.
  - Make `handleSave` async: if `editingPriority` → `await update.mutateAsync({ id: editingPriority.id, data: formData })`; else `await create.mutateAsync(formData)`. Then close the modal + reset form. REMOVE the optimistic `setPriorities(...)` writes inside handleSave (the query invalidation + existing `useEffect` re-sync handle the list).
  - Make `handleDelete` async: `await remove.mutateAsync(priority.id)`; then close the delete modal. REMOVE the optimistic `setPriorities((prev) => prev.filter(...))`.
  - Keep the local `priorities` state + the `useEffect(() => { if (prioritiesData) setPriorities(prioritiesData) }, [prioritiesData])` (it re-syncs after invalidation).
  - Optionally disable the save/delete buttons while `create.isPending || update.isPending || remove.isPending` (minimal; nice-to-have).
- [ ] Verify: `grep -n "setPriorities" src/app/tickets/priorities/page.tsx` → only the `useState` + the `useEffect` sync remain (no optimistic writes in handlers). `npx tsc --noEmit 2>&1 | grep "priorities/page.tsx"` → zero.
- [ ] Commit `refactor(frontend): wire priorities page CRUD to the API`.

## Task 4: Rewire tags page
- [ ] Same pattern in `src/app/tickets/tags/page.tsx` using `useTagMutations` (the tags page mirrors priorities: local `tags` state seeded from `useTagsQuery`, `handleSave`/`handleDelete`). Make handlers async, drop optimistic `setTags` writes, keep the `useEffect` sync.
- [ ] Verify grep + tsc-on-page zero. Commit `refactor(frontend): wire tags page CRUD to the API`.

## Task 5: Gate
- [ ] `npm run type-check` (only pre-existing test-matcher noise) ; `npm test -- --watchAll=false` (green) ; `npm run lint` (no new errors) ; `npm run build` (SUCCESS).
- [ ] Commit any straggler.

---

## Done Criteria
- prioritiesApi/tagsApi have `create/update/remove`; mutation hooks invalidate the list queries.
- The priorities + tags pages create/edit/delete through the API (no optimistic local writes); list re-syncs via query invalidation.
- `npm test` + `npm run build` green.
- (Controller validates writes through the BFF proxy: POST/PATCH/DELETE `/api/backend/ticket-priorities`.)

## Next (Phase 3b/3c)
- **3b:** permissions admin — `/settings/permissions` → GET /users + PUT /users/:id/permissions (wire AccessControlContext admin parts; drop mock users).
- **3c:** create/edit flows for clients/products/orders/budgets/inventory/tickets (+ messages, drag status). Then remove `src/mocks/*` + legacy.
