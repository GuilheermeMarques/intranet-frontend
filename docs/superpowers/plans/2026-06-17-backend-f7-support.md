# Backend F7 — Tickets / Priorities / Tags (support context) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** The `support` context — ticket priorities (CRUD), ticket tags (CRUD), and tickets (aggregate w/ messages, status, tag-id refs; CRUD + lookups + add-message). Matches the frontend English contracts.

**Architecture:** DDD, NEW context `support`. Use-cases return `Either`; unit specs use in-memory repos. Tickets store `tags` as a `String[]` (tag-id refs, Postgres array) and `priorityId`; messages are an append-only sub-collection (own table) loaded with the ticket; `save()` updates ticket columns/tags only (not messages). Snapshots not needed (priority/tags resolved client-side by id). Follows F4/F6 mechanical patterns. **Param-level `@Body(new ZodValidationPipe(...))`; literal routes before `/:id`.**

**Scope:** priorities + tags + tickets + messages + lookups. **Deferred to F7b:** attachments (multipart upload via S3 `Uploader` — needs `@types/multer` + FileInterceptor).

**Contracts (frontend `features/tickets/types.ts`):**
- `Priority { id, name, color, level:number, description?, isActive }`
- `Tag { id, name, color, description?, isActive, category? }`
- `Ticket { id, title, description, status:'todo'|'inProgress'|'inReview'|'done', priority:string(id), assignee, reporter, createdAt, updatedAt, category, tags:string[](ids), messages: Message[] }`
- `Message { id, author, content, timestamp, mentions:string[], type:'comment'|'status_update'|'assignment', attachments? }`

**Endpoints:**
- `GET/POST /ticket-priorities`, `PATCH/DELETE /ticket-priorities/:id`
- `GET/POST /ticket-tags`, `PATCH/DELETE /ticket-tags/:id`
- `GET /tickets` (?search&priority&status&category&assignee → `{tickets[]}`), `GET /tickets/:id`, `POST /tickets`, `PATCH /tickets/:id`, `DELETE /tickets/:id`, `GET /tickets/lookups` (→ `{categories[], assignees[]}`), `POST /tickets/:id/messages` (→ `{message}`)

**Working dir:** repo root; backend `intranet-backend/`. Branch `feat/backend-f7-support`. No Docker — gates: `pnpm test`, `pnpm prisma generate`, `pnpm build`.

---

## PART 1 — PRIORITIES (CRUD)

### Task 1: Priority vertical
- [ ] `src/domain/support/enterprise/entities/priority.ts` — `Entity<PriorityProps>` props `name, color, level:number, description?:string|null, isActive` ; getters + setters (name,color,level,description,isActive); `create(props: Optional<PriorityProps,'isActive'|'description'>, id?)` defaults isActive true, description null.
- [ ] `src/domain/support/application/repositories/priorities-repository.ts`:
```ts
import { Priority } from '../../enterprise/entities/priority'
export abstract class PrioritiesRepository {
  abstract findMany(): Promise<Priority[]>
  abstract findById(id: string): Promise<Priority | null>
  abstract create(priority: Priority): Promise<void>
  abstract save(priority: Priority): Promise<void>
  abstract delete(priority: Priority): Promise<void>
}
```
- [ ] `test/repositories/in-memory-priorities-repository.ts` (findMany sorted by level asc; findById; create/save/delete via id.equals).
- [ ] TDD 4 use-cases (`fetch-priorities` → {priorities}; `create-priority` ({name,color,level,description?,isActive?}→{priority}); `edit-priority` (patch; 404); `delete-priority` (404→right(null))).
- [ ] Prisma: add `TicketPriority` model:
```prisma
model TicketPriority {
  id          String   @id @default(uuid())
  name        String
  color       String
  level       Int
  description String?
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  @@map("ticket_priorities")
}
```
  `pnpm prisma generate`. Mapper + `prisma-priorities-repository.ts` (findMany orderBy level asc) + wire in `database.module.ts`.
- [ ] `priority-presenter.ts` → `{ id, name, color, level, description: x??null, isActive }`.
- [ ] Controllers (4): `fetch-priorities` GET /ticket-priorities; `create-priority` POST /ticket-priorities; `edit-priority` PATCH /ticket-priorities/:id; `delete-priority` DELETE /ticket-priorities/:id (204). Zod schemas in `controllers/schemas/priority-body-schema.ts` (`createPriorityBodySchema = z.object({name, color, level:z.number().int(), description:z.string().optional(), isActive:z.boolean().optional()})`, edit = `.partial()`). Param-level body pipes. Register 4 controllers + 4 use-cases.
- [ ] Seed: ~5 priorities (createMany guarded by count===0) from the frontend mock shape.
- [ ] Commit grouping: a couple of commits (domain+usecases, infra+seed). e.g. `feat(backend): add ticket priorities (CRUD) + seed`.

---

## PART 2 — TAGS (CRUD)

### Task 2: Tag vertical
Mirror priorities exactly.
- [ ] `src/domain/support/enterprise/entities/tag.ts` — props `name, color, description?:string|null, category?:string|null, isActive`; getters + setters; `create` defaults isActive true, description/category null.
- [ ] `tags-repository.ts` (findMany/findById/create/save/delete), `test/repositories/in-memory-tags-repository.ts` (findMany sorted by name).
- [ ] TDD 4 use-cases (`fetch-tags`, `create-tag` ({name,color,description?,category?,isActive?}), `edit-tag`, `delete-tag`).
- [ ] Prisma `TicketTag` model:
```prisma
model TicketTag {
  id          String   @id @default(uuid())
  name        String
  color       String
  description String?
  category    String?
  isActive    Boolean  @default(true) @map("is_active")
  createdAt   DateTime @default(now()) @map("created_at")
  @@map("ticket_tags")
}
```
  `pnpm prisma generate`. Mapper + repo + wire.
- [ ] `tag-presenter.ts` → `{ id, name, color, description: x??null, category: x??null, isActive }`.
- [ ] Controllers (4): GET/POST /ticket-tags, PATCH/DELETE /ticket-tags/:id. `tag-body-schema.ts`. Register.
- [ ] Seed: ~10 tags.
- [ ] Commit `feat(backend): add ticket tags (CRUD) + seed`.

---

## PART 3 — TICKETS (aggregate + messages)

### Task 3: Ticket + Message entities + repositories + in-memory repos
- [ ] `src/domain/support/enterprise/entities/message.ts` — `Entity<MessageProps>` props `ticketId:UniqueEntityID, author, content, type:'comment'|'status_update'|'assignment', mentions:string[], createdAt:Date`; getters; `create(props: Optional<MessageProps,'mentions'|'createdAt'|'type'>, id?)` defaults type 'comment', mentions [], createdAt now.
- [ ] `src/domain/support/enterprise/entities/ticket.ts` — `Entity<TicketProps>`:
```ts
export type TicketStatus = 'todo' | 'inProgress' | 'inReview' | 'done'
export interface TicketProps {
  title: string
  description: string
  status: TicketStatus
  priorityId: string
  assignee: string
  reporter: string
  category: string
  tags: string[]
  messages: Message[]
  createdAt: Date
  updatedAt?: Date | null
}
```
  getters for all; setters for title, description, status, priorityId, assignee, category, tags (each touch updatedAt); `create(props: Optional<TicketProps,'status'|'tags'|'messages'|'createdAt'>, id?)` defaults status 'todo', tags [], messages [], createdAt now.
- [ ] `tickets-repository.ts`:
```ts
import { Ticket } from '../../enterprise/entities/ticket'
export interface TicketFilters {
  search?: string
  priority?: string
  status?: string
  category?: string
  assignee?: string
}
export abstract class TicketsRepository {
  abstract findMany(filters: TicketFilters): Promise<Ticket[]>
  abstract findById(id: string): Promise<Ticket | null>
  abstract findDistinctCategories(): Promise<string[]>
  abstract findDistinctAssignees(): Promise<string[]>
  abstract create(ticket: Ticket): Promise<void>
  abstract save(ticket: Ticket): Promise<void>
  abstract delete(ticket: Ticket): Promise<void>
}
```
- [ ] `ticket-messages-repository.ts`:
```ts
import { Message } from '../../enterprise/entities/message'
export abstract class TicketMessagesRepository {
  abstract create(message: Message): Promise<void>
}
```
- [ ] In-memory repos: `test/repositories/in-memory-tickets-repository.ts` (findMany: search on title+description partial-ci, priority exact on priorityId, status exact, category exact, assignee exact; findDistinctCategories/Assignees sorted; create/save/delete; **findById returns the ticket with its messages** — store messages on the ticket entity, and the in-memory messages repo pushes into the matching ticket's messages array — see below) and `test/repositories/in-memory-ticket-messages-repository.ts`.
  - SIMPLEST in-memory wiring: `InMemoryTicketMessagesRepository` holds a reference to the `InMemoryTicketsRepository`; its `create(message)` finds the ticket by `message.ticketId` and pushes the message into `ticket.messages` (via a method or direct array). For the unit test of add-message, construct `new InMemoryTicketMessagesRepository(inMemoryTicketsRepository)`.
- [ ] Commit `feat(backend): add Ticket/Message entities, repositories and in-memory repos`.

### Task 4: Ticket use-cases (TDD)
- [ ] `create-ticket.ts` ({title, description, priorityId, assignee, reporter, category, tags?}): creates Ticket (status 'todo', messages []), persists → {ticket}.
- [ ] `fetch-tickets.ts` ({filters} → {tickets}).
- [ ] `get-ticket-by-id.ts` (→ {ticket} / ResourceNotFoundError).
- [ ] `edit-ticket.ts` ({id, title?, description?, status?, priorityId?, assignee?, category?, tags?}; 404 if missing; patch; save) → {ticket}.
- [ ] `delete-ticket.ts` (404→right(null)).
- [ ] `fetch-ticket-lookups.ts` (→ {categories, assignees} from repo distincts).
- [ ] `add-ticket-message.ts` ({ticketId, author, content, type?, mentions?}): load ticket (404); create Message(ticketId, ...); `ticketMessagesRepository.create(message)`; return {message}. Constructor: (ticketsRepository, ticketMessagesRepository).
- [ ] Each spec FIRST → FAIL → impl → PASS. Commit `feat(backend): add ticket use-cases (create, fetch, by-id, edit, delete, lookups, add-message) (TDD)`.

### Task 5: Tickets Prisma + presenters + controllers
- [ ] Add `Ticket` + `TicketMessage` models to `prisma/schema.prisma`:
```prisma
model Ticket {
  id          String    @id @default(uuid())
  title       String
  description String
  status      String
  priorityId  String    @map("priority_id")
  assignee    String
  reporter    String
  category    String
  tags        String[]
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime? @updatedAt @map("updated_at")

  messages TicketMessage[]

  @@index([status, updatedAt])
  @@map("tickets")
}

model TicketMessage {
  id        String   @id @default(uuid())
  ticketId  String   @map("ticket_id")
  author    String
  content   String
  type      String
  mentions  String[]
  createdAt DateTime @default(now()) @map("created_at")

  ticket Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@map("ticket_messages")
}
```
  `pnpm prisma generate`.
- [ ] `prisma-ticket-message-mapper.ts` (toDomain w/ `ticketId: new UniqueEntityID(raw.ticketId)`, type cast; toPrismaCreate(message) returns columns incl. ticketId).
- [ ] `prisma-ticket-mapper.ts` — `toDomain(raw, messages)` builds Ticket (status cast `as TicketStatus`, tags from raw.tags); `toPrismaTicket(ticket)` returns ticket columns (incl. `tags`, no messages).
- [ ] `prisma-tickets-repository.ts`: findMany (Prisma where: search → `OR:[{title:{contains,insensitive}},{description:{contains,insensitive}}]`; priorityId exact; status exact; category exact; assignee exact; include messages; orderBy updatedAt desc) ; findById (include messages, ordered by createdAt asc); findDistinctCategories/Assignees (distinct); create; save (update ticket columns/tags ONLY — do NOT touch messages); delete.
- [ ] `prisma-ticket-messages-repository.ts`: create → `prisma.ticketMessage.create({ data })`.
- [ ] Wire `TicketsRepository` + `TicketMessagesRepository` in `database.module.ts`.
- [ ] `message-presenter.ts` → `{ id, author, content, timestamp: createdAt.toISOString(), mentions, type, attachments: [] }` (attachments empty until F7b).
- [ ] `ticket-presenter.ts` → `{ id, title, description, status, priority: priorityId, assignee, reporter, createdAt:iso, updatedAt: x?iso:null, category, tags, messages: messages.map(MessagePresenter.toHTTP) }` (NOTE: frontend field is `priority` holding the id).
- [ ] Controllers (7): `fetch-tickets` GET /tickets (Zod query {search?,priority?,status?,category?,assignee?}); `get-ticket-lookups` GET /tickets/lookups; `create-ticket` POST /tickets; `get-ticket-by-id` GET /tickets/:id; `edit-ticket` PATCH /tickets/:id; `delete-ticket` DELETE /tickets/:id (204); `add-ticket-message` POST /tickets/:id/messages. Zod schemas in `controllers/schemas/ticket-body-schema.ts`. Param-level body pipes. **Register `GetTicketLookupsController` BEFORE `GetTicketByIdController`** (literal `/tickets/lookups` must not be shadowed by `/tickets/:id`). Register 7 controllers + 7 use-cases.
- [ ] Commit `feat(backend): add tickets endpoints (CRUD + lookups + messages)`.

### Task 6: Seed + Gate
- [ ] (Optional) seed a couple of tickets referencing seeded priorities/tags.
- [ ] GATE: `pnpm prisma generate`; `pnpm test` (priorities 4+ + tags 4+ + tickets 7+ + existing 82 all pass); `pnpm build` → `dist/infra/main.js` exists. git clean.
- [ ] Commit `feat(backend): seed sample tickets` (if added).

---

## Done Criteria
- priorities (CRUD), tags (CRUD), tickets (CRUD + lookups + add-message) — all with passing unit tests.
- Tickets store tags as `String[]` + priorityId; messages append-only sub-collection loaded with the ticket.
- `pnpm test` + `pnpm build` + `pnpm prisma generate` pass.

## Next (F7b / F8)
- **F7b:** attachments — `@types/multer`, `UploadAttachmentUseCase` (+ Uploader/StorageModule), `POST /tickets/:id/attachments` (FileInterceptor), Attachment entity/schema/repo, message presenter attachments.
- **F8:** dashboard summary. **F9:** hardening. **F10:** frontend integration.
