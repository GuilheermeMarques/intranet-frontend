# Frontend F10 Phase 3c (tickets) — Create + messages + drag status Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Wire the tickets kanban writes to the API: create ticket (`POST /tickets`), add message (`POST /tickets/:id/messages`), and status change via drag/drop or the status dropdown (`PATCH /tickets/:id`). Keep the optimistic local update for smooth kanban UX, then persist + invalidate.

**Scope:** create + message + status. **Deferred (follow-up):** real attachment upload (`POST /tickets/:id/attachments` multipart) — for now drop the SIMULATED attachments (`URL.createObjectURL`); the file-picker UI stays but doesn't persist files (leave a TODO).

**Working dir:** `intranet-frontend/`. Branch `feat/frontend-f10-p3c-tickets`. npm. Backend running; dev STOPPED while building. Gate: `npm test` + `npm run build`.

**Backend:** `POST /tickets` `{title,description,priorityId,assignee,reporter,category,tags}` → `{ticket}`; `PATCH /tickets/:id` `{status?,...}` → `{ticket}`; `POST /tickets/:id/messages` `{author,content,type?,mentions?}` → `{message}`.

---

## Task 1: tickets adapter writes + mutations
- [ ] Extend `src/features/tickets/api/ticketsApi.ts` (keep `list` + the local `statusConfig`/`TicketsData`). Add imports for `Message` from `../types`. Add:
```ts
export interface TicketInput {
  title: string
  description: string
  priorityId: string
  assignee: string
  reporter: string
  category: string
  tags: string[]
}
export interface MessageInput {
  author: string
  content: string
  type?: string
  mentions?: string[]
}
```
  add to the `ticketsApi` object:
```ts
  async create(data: TicketInput): Promise<Ticket> {
    const { ticket } = await httpClient.post<{ ticket: Ticket }>('/tickets', data)
    return ticket
  },
  async updateStatus(id: string, status: string): Promise<Ticket> {
    const { ticket } = await httpClient.patch<{ ticket: Ticket }>(`/tickets/${id}`, { status })
    return ticket
  },
  async addMessage(ticketId: string, data: MessageInput): Promise<Message> {
    const { message } = await httpClient.post<{ message: Message }>(`/tickets/${ticketId}/messages`, data)
    return message
  },
```
  (import `Ticket, Message` types as needed.)
- [ ] `src/features/tickets/hooks/useTicketMutations.ts`:
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi, TicketInput, MessageInput } from '../api/ticketsApi'

export function useTicketMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['tickets'] })
  const create = useMutation({ mutationFn: (data: TicketInput) => ticketsApi.create(data), onSuccess: invalidate })
  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => ticketsApi.updateStatus(id, status),
    onSuccess: invalidate,
  })
  const addMessage = useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: MessageInput }) => ticketsApi.addMessage(ticketId, data),
    onSuccess: invalidate,
  })
  return { create, updateStatus, addMessage }
}
```
- [ ] Extend `ticketsApi.test.ts`: assert `create` POSTs `/tickets`→`.ticket`; `updateStatus` PATCHes `/tickets/:id` with `{status}`→`.ticket`; `addMessage` POSTs `/tickets/:id/messages`→`.message`.
- [ ] Commit `feat(frontend): add ticket create/updateStatus/addMessage mutations`.

## Task 2: Wire the tickets page handlers
READ `src/app/tickets/page.tsx` (large). Import `useTicketMutations`; `const { create, updateStatus, addMessage } = useTicketMutations()`.

- [ ] **handleCreateTicket** → async. Replace the body (drop the simulated `attachments`, the synthetic initial `messages`, and the optimistic `setTickets`):
```tsx
const handleCreateTicket = async () => {
  if (!newTicketForm.title.trim() || !newTicketForm.description.trim() || !newTicketForm.priority) return
  await create.mutateAsync({
    title: newTicketForm.title,
    description: newTicketForm.description,
    priorityId: newTicketForm.priority,
    assignee: newTicketForm.assignee || 'Não atribuído',
    reporter: currentUser,
    category: newTicketForm.category || 'Geral',
    tags: newTicketForm.tags,
  })
  handleCloseNewTicketModal()
}
```
- [ ] **handleSendMessage** → async. Keep the `@mention` parsing; drop simulated attachments + the optimistic `setTickets`; persist + update the open drawer with the RETURNED message:
```tsx
const handleSendMessage = async () => {
  if (!newMessage.trim() || !selectedTicket) return
  const mentionRegex = /@(\w+)/g
  const mentions: string[] = []
  let match
  while ((match = mentionRegex.exec(newMessage)) !== null) mentions.push(match[1])

  const message = await addMessage.mutateAsync({
    ticketId: selectedTicket.id,
    data: { author: currentUser, content: newMessage, type: 'comment', mentions },
  })
  setSelectedTicket((prev) => (prev ? { ...prev, messages: [...prev.messages, message] } : null))
  setNewMessage('')
  setSelectedFiles([])
}
```
- [ ] **handleDragEnd** — in BOTH status-change branches (drop on a column `newStatus`, and drop on a ticket of a different status `overTicket.status`), keep the optimistic `setTickets(...)` AND persist: add `updateStatus.mutate({ id: activeId, status: <newStatus|overTicket.status> })` right after each optimistic `setTickets`. Do NOT persist on the same-status reorder branch (no status change).
- [ ] **handleStatusChange(ticketId, newStatus)** — keep the optimistic `setTickets`/`setSelectedTicket`, then add `updateStatus.mutate({ id: ticketId, status: newStatus })`.
- [ ] Leave the file-picker UI + `selectedFiles`/`newTicketFiles` state as-is (cleared after send) but NOT uploaded; add a `// TODO(F10-attachments): wire POST /tickets/:id/attachments (multipart)` near the file UI. The `getFileType`/`formatFileSize` helpers can stay (still used by the file-list display) — if any becomes unused, remove it to satisfy lint.
- [ ] Keep ALL dnd-kit setup, the kanban columns, the detail drawer/modal, filters, and the local `tickets` state + its `useEffect` query-sync (it re-syncs after invalidation).
- [ ] Verify: `npx tsc --noEmit 2>&1 | grep "tickets/page.tsx"` → zero. `grep -n "URL.createObjectURL" src/app/tickets/page.tsx` → empty (simulated attachments removed).
- [ ] Commit `refactor(frontend): wire tickets create/message/status to the API`.

## Task 3: Gate
- [ ] `npm run type-check` (pre-existing test noise only); `npm test -- --watchAll=false` (green); `npm run lint` (no new errors — remove any now-unused helper/var); `npm run build` (SUCCESS). Commit any straggler.

---

## Done Criteria
- New ticket persists via `POST /tickets`; messages via `POST /tickets/:id/messages` (drawer shows the returned message); drag/drop + status dropdown persist via `PATCH /tickets/:id` (optimistic + invalidation re-sync).
- No simulated attachments; file UI left with a TODO (real upload deferred).
- `npm test` + `npm run build` green.
- (Controller validates via BFF: POST a ticket, GET /tickets shows it; POST a message; PATCH status.)

## Next (final)
- Attachment upload (multipart through the BFF — verify the proxy forwards form-data); preferences via `/me/preferences`; remove remaining mocks (theme.json, settings.json, purchases.json — flag those without a backend).
