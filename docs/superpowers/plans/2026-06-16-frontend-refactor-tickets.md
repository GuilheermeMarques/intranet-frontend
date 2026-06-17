# Frontend Refactor — Tickets/Priorities/Tags Vertical Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Apply the proven feature-module + React Query pattern to the `support` domain — the three entities `tickets`, `ticket-priorities`, `ticket-tags` across three pages — removing direct `@/mocks/*` imports and the legacy `@/types/ticket`.

**Architecture:** One `src/features/tickets/` module holding the shared English contracts (`Ticket`, `Message`, `Attachment`, `Priority`, `Tag`), three mock adapters (`prioritiesApi`, `tagsApi`, `ticketsApi`) and three hooks. Types are ALREADY English — no rename. Executed as three sub-verticals (priorities → tags → tickets/kanban), smallest-first, each keeping the page green. The priorities/tags pages are local-CRUD admin pages: the hook seeds their initial list; local mutation state stays. The tickets page is a dnd-kit kanban that filters its local mutable state client-side: the hooks seed initial data; the kanban/drag/filter logic stays.

**Tech Stack:** Next.js 15, TypeScript, MUI, @dnd-kit, TanStack React Query v5, Jest + RTL.

**Working dir:** `intranet-frontend/`. Branch: `refactor/frontend-tickets`.

**Env constraints:** Cypress can't run in the sandbox — gates are `npm test` + `npm run build`. Pre-existing tsc matcher noise lives only in `*.test.*` files; ignore it.

**Out of scope:** No page decomposition (the 1366-line tickets page stays one file). The dead `shared/utils/{ticketPrioritySystem,ticketTagSystem,categorySystem}.ts` (unused by any page) are NOT touched here. No backend.

---

## Task T1: Shared feature contracts

**Create:** `src/features/tickets/types.ts`

```ts
export type TicketStatus = 'todo' | 'inProgress' | 'inReview' | 'done';
export type TicketMessageType = 'comment' | 'status_update' | 'assignment';
export type AttachmentType = 'image' | 'document' | 'other';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  mentions: string[];
  type: TicketMessageType;
  attachments?: Attachment[];
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: string;
  assignee: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  messages: Message[];
}

export interface Priority {
  id: string;
  name: string;
  color: string;
  level: number;
  description?: string;
  isActive: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  category?: string;
}
```

- [ ] Create file, `npm run type-check` (no new errors from this file), commit `feat(frontend): add ticket/priority/tag contracts in features/tickets/types.ts`.

---

## Sub-vertical A — Priorities

### Task T2: prioritiesApi (TDD)
**Create:** `src/features/tickets/api/prioritiesApi.ts`, test `…/prioritiesApi.test.ts`

- [ ] Failing test:
```ts
import { prioritiesApi } from './prioritiesApi';

describe('prioritiesApi', () => {
  it('returns all priorities', async () => {
    const result = await prioritiesApi.list();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('level');
  });
});
```
- [ ] Run → FAIL. Implement:
```ts
import prioritiesMock from '@/mocks/priorities.json';
import type { Priority } from '../types';

const priorities = prioritiesMock.priorities as Priority[];
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const prioritiesApi = {
  async list(): Promise<Priority[]> {
    await delay(0);
    return [...priorities];
  },
};
```
(If the JSON cast errors, use `as unknown as Priority[]`.) Run → PASS. Commit `feat(frontend): add priorities mock API adapter`.

### Task T3: usePrioritiesQuery (TDD)
**Create:** `src/features/tickets/hooks/usePrioritiesQuery.ts`, test `…/usePrioritiesQuery.test.tsx`

- [ ] Failing test (RTL renderHook with a QueryClientProvider wrapper, asserting `isSuccess` and `data.length > 0`). Run → FAIL.
- [ ] Implement:
```ts
import { useQuery } from '@tanstack/react-query';
import { prioritiesApi } from '../api/prioritiesApi';

export function usePrioritiesQuery() {
  return useQuery({ queryKey: ['ticket-priorities'], queryFn: () => prioritiesApi.list() });
}
```
Run → PASS. Commit `feat(frontend): add usePrioritiesQuery hook`.

### Task T4: Rewire priorities page
**Modify:** `src/app/tickets/priorities/page.tsx` (292 lines, local-CRUD)

It currently does `const [priorities, setPriorities] = useState<Priority[]>(prioritiesData.priorities)` and imports `{ Priority } from '@/types/ticket'`.

- [ ] Replace imports: remove `import prioritiesData from '@/mocks/priorities.json';`; repoint `{ Priority }` to `@/features/tickets/types`; add `import { usePrioritiesQuery } from '@/features/tickets/hooks/usePrioritiesQuery';` and `useEffect` from react.
- [ ] Seed local state from the hook (keep local CRUD mutations working):
```tsx
const { data: prioritiesData } = usePrioritiesQuery();
const [priorities, setPriorities] = useState<Priority[]>([]);
useEffect(() => {
  if (prioritiesData) setPriorities(prioritiesData);
}, [prioritiesData]);
```
  (Rename any local identifier collision; the import `prioritiesData` is removed so the name is free.)
- [ ] Keep all create/edit/delete handlers and modals exactly as-is (they mutate `priorities` via `setPriorities`).
- [ ] Verify: `grep -n "@/mocks/priorities\|@/types/ticket" src/app/tickets/priorities/page.tsx` → ZERO. `npx tsc --noEmit 2>&1 | grep "priorities/page.tsx"` → ZERO. `npm test`, `npm run build` → green. Commit `refactor(frontend): wire priorities page to React Query`.

---

## Sub-vertical B — Tags

### Task T5: tagsApi (TDD)
**Create:** `src/features/tickets/api/tagsApi.ts`, test.
- [ ] Failing test (`list()` returns tags with `name`/`color`). Implement analogously to prioritiesApi over `@/mocks/tags.json` → `Tag[]`. Run FAIL→PASS. Commit `feat(frontend): add tags mock API adapter`.

### Task T6: useTagsQuery (TDD)
**Create:** `src/features/tickets/hooks/useTagsQuery.ts`, test.
- [ ] Failing test → implement:
```ts
import { useQuery } from '@tanstack/react-query';
import { tagsApi } from '../api/tagsApi';

export function useTagsQuery() {
  return useQuery({ queryKey: ['ticket-tags'], queryFn: () => tagsApi.list() });
}
```
Run FAIL→PASS. Commit `feat(frontend): add useTagsQuery hook`.

### Task T7: Rewire tags page
**Modify:** `src/app/tickets/tags/page.tsx` (280 lines, local-CRUD, same pattern as priorities).
- [ ] Remove `@/mocks/tags.json` import; repoint `{ Tag }` to `@/features/tickets/types`; add `useTagsQuery` + `useEffect`. Seed local state:
```tsx
const { data: tagsData } = useTagsQuery();
const [tags, setTags] = useState<Tag[]>([]);
useEffect(() => {
  if (tagsData) setTags(tagsData);
}, [tagsData]);
```
- [ ] Keep CRUD handlers/modals as-is. Verify grep ZERO for `@/mocks/tags`/`@/types/ticket`, tsc-on-page ZERO, `npm test`/`npm run build` green. Commit `refactor(frontend): wire tags page to React Query`.

---

## Sub-vertical C — Tickets / Kanban

### Task T8: ticketsApi (TDD)
**Create:** `src/features/tickets/api/ticketsApi.ts`, test.

The mock `src/mocks/tickets.json` has `{ tickets, statusConfig }`. The kanban needs both. The page filters its LOCAL state client-side, so the adapter does NOT filter — it returns the full set + statusConfig.

- [ ] Failing test:
```ts
import { ticketsApi } from './ticketsApi';

describe('ticketsApi', () => {
  it('returns all tickets plus statusConfig', async () => {
    const result = await ticketsApi.list();
    expect(result.tickets.length).toBeGreaterThan(0);
    expect(result.tickets[0]).toHaveProperty('priority');
    expect(result.tickets[0]).toHaveProperty('tags');
    expect(result.statusConfig).toBeDefined();
  });
});
```
- [ ] Run → FAIL. Implement (define `TicketsData` inline-typed via the mock; read `statusConfig` shape from the JSON):
```ts
import ticketsMock from '@/mocks/tickets.json';
import type { Ticket } from '../types';

const tickets = ticketsMock.tickets as unknown as Ticket[];
const statusConfig = ticketsMock.statusConfig;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export interface TicketsData {
  tickets: Ticket[];
  statusConfig: typeof statusConfig;
}

export const ticketsApi = {
  async list(): Promise<TicketsData> {
    await delay(0);
    return { tickets: [...tickets], statusConfig };
  },
};
```
Run → PASS. Commit `feat(frontend): add tickets mock API adapter`.

### Task T9: useTicketsQuery (TDD)
**Create:** `src/features/tickets/hooks/useTicketsQuery.ts`, test.
- [ ] Failing test (`data.tickets.length > 0`). Implement:
```ts
import { useQuery } from '@tanstack/react-query';
import { ticketsApi } from '../api/ticketsApi';

export function useTicketsQuery() {
  return useQuery({ queryKey: ['tickets'], queryFn: () => ticketsApi.list() });
}
```
Run FAIL→PASS. Commit `feat(frontend): add useTicketsQuery hook`.

### Task T10: Rewire tickets kanban page
**Modify:** `src/app/tickets/page.tsx` (1366 lines — READ the relevant regions; do NOT decompose). Keep ALL dnd-kit/kanban/modal/message logic and Portuguese copy intact.

Current module-level code reads the mocks:
```tsx
import prioritiesData from '@/mocks/priorities.json';
import tagsData from '@/mocks/tags.json';
import ticketsData from '@/mocks/tickets.json';
import { Attachment, Message, Priority, Tag, Ticket } from '@/types/ticket';
// ...
const priorities: Priority[] = prioritiesData.priorities;
const tags: Tag[] = tagsData.tags;
const mockTickets: Ticket[] = ticketsData.tickets as Ticket[];
const statusConfig = ticketsData.statusConfig;
const getPriorityConfig = (priorityId: string) => { /* uses module-level `priorities` */ };
const getTagById = (tagId: string) => { /* uses module-level `tags` */ };
```
The component does `const [tickets, setTickets] = useState<Ticket[]>(mockTickets)`, derives `categories/assignees/availablePriorities` from `tickets`/`priorities`, and filters local `tickets` client-side.

- [ ] Repoint the type import `@/types/ticket` → `@/features/tickets/types`.
- [ ] Remove the three `@/mocks/*` imports and the module-level `priorities`/`tags`/`mockTickets`/`statusConfig` consts.
- [ ] Convert the module-level `getPriorityConfig`/`getTagById` helpers and the kanban card sub-components that call them so the priority/tag lists come from the hooks. The simplest faithful approach: move `getPriorityConfig`/`getTagById` to be defined INSIDE the main page component (closures over hook data), and pass what the card sub-components need via props (or inline the lookups). If a card sub-component is defined at module scope and calls `getPriorityConfig`, give it `priorities`/`tags` (or the resolved values) via props. Keep their rendering output identical.
- [ ] In the component, load data via hooks:
```tsx
const { data: priorities = [] } = usePrioritiesQuery();
const { data: tags = [] } = useTagsQuery();
const { data: ticketsResult } = useTicketsQuery();
const [tickets, setTickets] = useState<Ticket[]>([]);
useEffect(() => {
  if (ticketsResult?.tickets) setTickets(ticketsResult.tickets);
}, [ticketsResult]);
const statusConfig = ticketsResult?.statusConfig ?? {};
```
  Import `usePrioritiesQuery`, `useTagsQuery`, `useTicketsQuery` from `@/features/tickets/hooks/...`, and `useEffect`.
- [ ] Keep the local filtering, drag-and-drop status mutation, new-ticket creation, and message logic operating on local `tickets` state exactly as before. `availablePriorities`/`categories`/`assignees` derivations stay (now over hook-sourced `priorities`/local `tickets`).
- [ ] Guard for empty initial render: where `statusConfig`/`priorities` are mapped before data arrives, the `?? []`/`?? {}` defaults above prevent crashes. Add a minimal nothing-special loading guard only if needed to avoid a runtime error (don't over-engineer).
- [ ] Verify: `grep -nE "@/mocks/(tickets|priorities|tags)|@/types/ticket" src/app/tickets/page.tsx` → ZERO. `npx tsc --noEmit 2>&1 | grep "app/tickets/page.tsx"` → ZERO. Commit `refactor(frontend): wire tickets kanban page to React Query`.

### Task T11: Delete legacy type + GREEN GATE
**Delete:** `src/types/ticket.ts`
- [ ] Confirm no consumers remain: `grep -rln "@/types/ticket" src` → empty. Then `git rm src/types/ticket.ts`.
- [ ] GREEN GATE: `npx tsc --noEmit 2>&1 | grep -v "__tests__\|\.test\.\|\.spec\."` → ZERO production errors; `npm test -- --watchAll=false` → all pass; `npm run lint` → no new errors; `npm run build` → SUCCESS (all routes incl. `/tickets`, `/tickets/priorities`, `/tickets/tags`); `npm run knip` → `src/types/ticket.ts` gone, no new dead code.
- [ ] Commit `refactor(frontend): remove legacy @/types/ticket`.

---

## Done Criteria
- `/tickets`, `/tickets/priorities`, `/tickets/tags` import no `@/mocks/*` and no `@/types/ticket`; data flows through the feature hooks.
- `src/features/tickets/` holds the English contracts, three adapters, three hooks, each tested.
- Kanban drag-drop, ticket messages, and priorities/tags CRUD behave identically.
- `src/types/ticket.ts` deleted; full Jest green + `npm run build` succeeds.

## Notes / follow-ups (not in scope)
- `shared/utils/{ticketPrioritySystem,ticketTagSystem,categorySystem}.ts` are unused by any page (dead) — candidate for a separate cleanup.
- The tickets page remains 1366 lines; decomposition is the separate R4 effort.
