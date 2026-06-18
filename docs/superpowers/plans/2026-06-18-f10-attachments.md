# F10 — Ticket Attachments (upload + display) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development.

**Goal:** Complete ticket attachments end-to-end: the backend auto-provisions the S3/MinIO bucket and returns a ticket's attachments on `GET /tickets`; the frontend uploads selected files (multipart through the BFF) and lists them in the ticket detail. Validated: the BFF proxy already forwards multipart correctly and `POST /tickets/:id/attachments` persists to MinIO (the only gap was the missing bucket).

**Scope:** ticket-level attachments (not per-message). The message UI's per-message attachments stay empty.

**Working dir:** repo root. Branch `feat/frontend-f10-p3c-attachments` (monorepo — backend + frontend on one branch). Backend = pnpm (`intranet-backend/`); frontend = npm (`intranet-frontend/`). Backend running; frontend dev STOPPED while building.

---

## PART A — Backend (intranet-backend, pnpm)

### Task A1: S3Storage auto-ensures the bucket
- [ ] In `src/infra/storage/s3-storage.ts`: add lazy bucket-ensure so uploads work after a fresh `docker compose up` (MinIO doesn't auto-create buckets). Import `HeadBucketCommand, CreateBucketCommand` from `@aws-sdk/client-s3`. Add a cached flag + helper, call it at the start of `upload`:
```ts
  private bucketReady = false

  private async ensureBucket(): Promise<void> {
    if (this.bucketReady) return
    const Bucket = this.envService.get('S3_BUCKET')
    try {
      await this.client.send(new HeadBucketCommand({ Bucket }))
    } catch {
      await this.client.send(new CreateBucketCommand({ Bucket }))
    }
    this.bucketReady = true
  }
```
  and `await this.ensureBucket()` as the first line of `upload(...)`.
- [ ] `pnpm build` passes. Commit `feat(backend): S3Storage auto-creates the bucket if missing`.

### Task A2: Return ticket attachments on fetch
- [ ] Add `toDomain` to `src/infra/database/prisma/mappers/prisma-attachment-mapper.ts` (it currently only has `toPrisma`):
```ts
import { TicketAttachment as PrismaTicketAttachment } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Attachment, AttachmentType } from '@/domain/support/enterprise/entities/attachment'

  static toDomain(raw: PrismaTicketAttachment): Attachment {
    return Attachment.create(
      {
        ticketId: new UniqueEntityID(raw.ticketId),
        messageId: raw.messageId ? new UniqueEntityID(raw.messageId) : null,
        name: raw.name,
        url: raw.url,
        type: raw.type as AttachmentType,
        size: raw.size,
        uploadedBy: raw.uploadedBy,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    )
  }
```
  (keep the existing `toPrisma`; add imports as needed.)
- [ ] `Ticket` entity (`src/domain/support/enterprise/entities/ticket.ts`): add `attachments: Attachment[]` to `TicketProps` (import `Attachment` from `./attachment`), a getter, and default `attachments: props.attachments ?? []` in `create` (add to the `Optional<...>` set).
- [ ] `prisma-ticket-mapper.ts` `toDomain`: accept attachments and set them — change signature to `toDomain(raw, messages: Message[], attachments: Attachment[] = [])` and pass `attachments` into `Ticket.create({...})`. (`toPrismaTicket` unchanged.)
- [ ] `prisma-tickets-repository.ts`: in `findMany` and `findById`, add `attachments: { orderBy: { createdAt: 'asc' } }` to the `include`, and pass `row.attachments.map(PrismaAttachmentMapper.toDomain)` as the 3rd arg to `PrismaTicketMapper.toDomain`. (Import `PrismaAttachmentMapper`.)
- [ ] `ticket-presenter.ts`: add `attachments: ticket.attachments.map(AttachmentPresenter.toHTTP)` to the output (import `AttachmentPresenter` from `../presenters/attachment-presenter`).
- [ ] In-memory tickets repo: no change needed (Ticket.create defaults attachments to []). Existing unit specs still pass.
- [ ] `pnpm test` (all green) + `pnpm build` (dist/infra/main.js). Commit `feat(backend): include ticket attachments in GET /tickets`.

---

## PART B — Frontend (intranet-frontend, npm)

### Task B1: Ticket type + uploadAttachment + mutation
- [ ] `src/features/tickets/types.ts`: add `attachments?: Attachment[]` to the `Ticket` interface (the `Attachment` type already exists in this file).
- [ ] `src/features/tickets/api/ticketsApi.ts`: add an upload method (NOT via httpClient — multipart needs FormData + browser-set content-type):
```ts
import type { Attachment } from '../types'

  async uploadAttachment(ticketId: string, file: File): Promise<Attachment> {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch(`/api/backend/tickets/${ticketId}/attachments`, {
      method: 'POST',
      body: formData,
    })
    if (!res.ok) {
      const error = await res.json().catch(() => ({}))
      throw new Error(error.message ?? 'Falha no upload do anexo.')
    }
    const { attachment } = await res.json()
    return attachment as Attachment
  },
```
- [ ] `useTicketMutations.ts`: add an `uploadAttachment` mutation:
```ts
  const uploadAttachment = useMutation({
    mutationFn: ({ ticketId, file }: { ticketId: string; file: File }) => ticketsApi.uploadAttachment(ticketId, file),
    onSuccess: invalidate,
  })
```
  and return it.
- [ ] Extend `ticketsApi.test.ts`: mock global `fetch` for `uploadAttachment` (assert it POSTs FormData to `/api/backend/tickets/:id/attachments` and returns `.attachment`). Keep the other tests.
- [ ] Commit `feat(frontend): add ticket attachment upload (multipart via BFF)`.

### Task B2: Upload selected files + display ticket attachments
- [ ] In `src/app/tickets/page.tsx`:
  - Pull `uploadAttachment` from `useTicketMutations()`.
  - **On create:** in `handleCreateTicket`, after `const ticket = await create.mutateAsync(...)` (change create to capture the returned ticket), if `newTicketFiles.length` → `await Promise.all(newTicketFiles.map((file) => uploadAttachment.mutateAsync({ ticketId: ticket.id, file })))`. Then close modal + clear `newTicketFiles`.
  - **On message send:** in `handleSendMessage`, after persisting the message, if `selectedFiles.length` → `await Promise.all(selectedFiles.map((file) => uploadAttachment.mutateAsync({ ticketId: selectedTicket.id, file })))`, then `setSelectedFiles([])`. (The `invalidate` on success refetches the ticket list with attachments; the open drawer's `selectedTicket` won't auto-refresh its attachments — acceptable, or re-fetch is out of scope.)
  - **Display:** in the ticket detail drawer/modal, add an "Anexos" section listing `selectedTicket.attachments` (name + size via the existing `formatFileSize`). Use a simple list; each item a link to the attachment `url` (it's an S3 key — link as `#` or display name only is fine for now; the URL is not a public link without a signed-URL step, so just display name + size).
  - Remove the TODO(F10-attachments) comment.
- [ ] Verify `npx tsc --noEmit 2>&1 | grep "tickets/page.tsx"` → zero.
- [ ] Commit `feat(frontend): upload selected files to tickets + list attachments in detail`.

### Task B3: Gate
- [ ] Frontend: `npm run type-check` (pre-existing test noise only); `npm test -- --watchAll=false` (green); `npm run lint`; `npm run build` (SUCCESS). Commit any straggler.

---

## Done Criteria
- Backend auto-creates the bucket; `GET /tickets` returns each ticket's `attachments[]`.
- Frontend uploads selected files (multipart via BFF) on ticket create + message send; detail drawer lists the ticket's attachments.
- Backend `pnpm test`/`pnpm build` + frontend `npm test`/`npm run build` green.
- (Controller validates via BFF: upload a file → it appears in GET /tickets attachments.)

## Notes
- Attachment `url` is an S3 object key (not a public URL). Serving/downloading would need a signed-URL endpoint — out of scope (display name+size for now).
