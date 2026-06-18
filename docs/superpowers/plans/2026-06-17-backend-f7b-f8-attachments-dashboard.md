# Backend F7b + F8 — Attachments + Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** (F7b) ticket attachments via multipart upload to S3/MinIO, completing the `support` context; (F8) the dashboard summary endpoint aggregating across domains.

**Architecture:** DDD. F7b uses the existing `Uploader` abstraction (`domain/support/application/storage/uploader.ts`) + `StorageModule` (S3Storage) from F1; the upload use-case validates mime type, uploads, persists an `Attachment`. F8 is a read-only aggregation use-case over existing repos. Use-cases return `Either`; unit specs use in-memory repos + a fake uploader.

**Working dir:** repo root; backend `intranet-backend/`. Branch `feat/backend-f7b-f8`. No Docker — gates: `pnpm test`, `pnpm prisma generate`, `pnpm build`.

---

## PART A — F7b ATTACHMENTS

### Task A1: Multer types
- [ ] `pnpm add -D @types/multer@^1.4.7` (from `intranet-backend/`).
- [ ] In `intranet-backend/tsconfig.json`, add `"multer"` to `compilerOptions.types` (currently `["vitest/globals"]` → `["vitest/globals", "multer"]`).
- [ ] `pnpm build` still passes. Commit `chore(backend): restore multer types for uploads`.

### Task A2: Attachment entity + repository + storage error + fakes
- [ ] `src/domain/support/enterprise/entities/attachment.ts`:
```ts
import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export type AttachmentType = 'image' | 'document' | 'other'

export interface AttachmentProps {
  ticketId: UniqueEntityID
  messageId?: UniqueEntityID | null
  name: string
  url: string
  type: AttachmentType
  size: number
  uploadedBy: string
  createdAt: Date
}

export class Attachment extends Entity<AttachmentProps> {
  get ticketId() { return this.props.ticketId }
  get messageId() { return this.props.messageId }
  get name() { return this.props.name }
  get url() { return this.props.url }
  get type() { return this.props.type }
  get size() { return this.props.size }
  get uploadedBy() { return this.props.uploadedBy }
  get createdAt() { return this.props.createdAt }

  static create(props: Optional<AttachmentProps, 'messageId' | 'createdAt'>, id?: UniqueEntityID) {
    return new Attachment({ ...props, messageId: props.messageId ?? null, createdAt: props.createdAt ?? new Date() }, id)
  }
}
```
- [ ] `src/domain/support/application/repositories/attachments-repository.ts`:
```ts
import { Attachment } from '../../enterprise/entities/attachment'
export abstract class AttachmentsRepository {
  abstract create(attachment: Attachment): Promise<void>
}
```
- [ ] `src/domain/support/application/use-cases/errors/invalid-attachment-type-error.ts`:
```ts
import { UseCaseError } from '@/core/errors/use-case-error'
export class InvalidAttachmentTypeError extends Error implements UseCaseError {
  constructor(type: string) {
    super(`File type "${type}" is not valid.`)
  }
}
```
- [ ] `test/repositories/in-memory-attachments-repository.ts` (`items: Attachment[]`; `create` push).
- [ ] `test/storage/fake-uploader.ts`:
```ts
import { randomUUID } from 'node:crypto'
import { UploadParams, Uploader } from '@/domain/support/application/storage/uploader'

interface Upload { fileName: string; url: string }

export class FakeUploader implements Uploader {
  public uploads: Upload[] = []

  async upload({ fileName }: UploadParams): Promise<{ url: string }> {
    const url = randomUUID()
    this.uploads.push({ fileName, url })
    return { url }
  }
}
```
- [ ] Commit `feat(backend): add Attachment entity, repository and test doubles`.

### Task A3: UploadAttachmentUseCase (TDD)
- [ ] Spec `src/domain/support/application/use-cases/upload-attachment.spec.ts` (FIRST → FAIL):
  - valid image (`image/png`) → right, attachment persisted, `type==='image'`, url set, uploader called once.
  - `application/pdf` → `type==='document'`.
  - invalid type (`application/zip`) → `Left(InvalidAttachmentTypeError)`, uploader NOT called.
  Construct `new UploadAttachmentUseCase(inMemoryAttachmentsRepository, fakeUploader)`. Input `{ ticketId, fileName, fileType, body: Buffer.from(''), size, uploadedBy }`.
- [ ] Implement `src/domain/support/application/use-cases/upload-attachment.ts`:
```ts
import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { AttachmentsRepository } from '../repositories/attachments-repository'
import { Uploader } from '../storage/uploader'
import { Attachment, AttachmentType } from '../../enterprise/entities/attachment'
import { InvalidAttachmentTypeError } from './errors/invalid-attachment-type-error'

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
const DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
]

interface UploadAttachmentUseCaseRequest {
  ticketId: string
  fileName: string
  fileType: string
  body: Buffer
  size: number
  uploadedBy: string
}

type UploadAttachmentUseCaseResponse = Either<InvalidAttachmentTypeError, { attachment: Attachment }>

@Injectable()
export class UploadAttachmentUseCase {
  constructor(
    private attachmentsRepository: AttachmentsRepository,
    private uploader: Uploader,
  ) {}

  async execute({ ticketId, fileName, fileType, body, size, uploadedBy }: UploadAttachmentUseCaseRequest): Promise<UploadAttachmentUseCaseResponse> {
    const isImage = IMAGE_TYPES.includes(fileType)
    const isDocument = DOCUMENT_TYPES.includes(fileType)
    if (!isImage && !isDocument) return left(new InvalidAttachmentTypeError(fileType))

    const { url } = await this.uploader.upload({ fileName, fileType, body })

    const type: AttachmentType = isImage ? 'image' : 'document'
    const attachment = Attachment.create({
      ticketId: new UniqueEntityID(ticketId),
      name: fileName,
      url,
      type,
      size,
      uploadedBy,
    })

    await this.attachmentsRepository.create(attachment)
    return right({ attachment })
  }
}
```
- [ ] Run → PASS (3). Commit `feat(backend): add UploadAttachmentUseCase (TDD)`.

### Task A4: Prisma + presenter + controller + wiring
- [ ] Add to `prisma/schema.prisma`:
```prisma
model TicketAttachment {
  id         String   @id @default(uuid())
  ticketId   String   @map("ticket_id")
  messageId  String?  @map("message_id")
  name       String
  url        String
  type       String
  size       Int
  uploadedBy String   @map("uploaded_by")
  createdAt  DateTime @default(now()) @map("created_at")

  ticket Ticket @relation(fields: [ticketId], references: [id], onDelete: Cascade)

  @@map("ticket_attachments")
}
```
  Add `attachments TicketAttachment[]` to the `Ticket` model (before `@@map`). `pnpm prisma generate`.
- [ ] `prisma-attachment-mapper.ts` — `toPrisma(attachment): Prisma.TicketAttachmentUncheckedCreateInput` (id, ticketId, messageId ?? null, name, url, type, size, uploadedBy, createdAt).
- [ ] `prisma-attachments-repository.ts` — `create` via `prisma.ticketAttachment.create({ data: toPrisma(...) })`.
- [ ] Wire `AttachmentsRepository` in `database.module.ts`.
- [ ] `attachment-presenter.ts` → `{ id, name, url, type, size, uploadedBy, uploadedAt: createdAt.toISOString() }`.
- [ ] `upload-attachment.controller.ts`:
```ts
import { BadRequestException, Controller, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { UploadAttachmentUseCase } from '@/domain/support/application/use-cases/upload-attachment'
import { AttachmentPresenter } from '../presenters/attachment-presenter'

@Controller('/tickets/:id/attachments')
export class UploadAttachmentController {
  constructor(private uploadAttachment: UploadAttachmentUseCase) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async handle(
    @Param('id') ticketId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserPayload,
  ) {
    if (!file) throw new BadRequestException('File is required')

    const result = await this.uploadAttachment.execute({
      ticketId,
      fileName: file.originalname,
      fileType: file.mimetype,
      body: file.buffer,
      size: file.size,
      uploadedBy: user.sub,
    })

    if (result.isLeft()) throw new BadRequestException(result.value.message)
    return { attachment: AttachmentPresenter.toHTTP(result.value.attachment) }
  }
}
```
- [ ] In `http.module.ts`: import `StorageModule` (add to `imports`), register `UploadAttachmentController` + `UploadAttachmentUseCase`.
- [ ] Commit `feat(backend): add POST /tickets/:id/attachments (multipart upload)`.

---

## PART B — F8 DASHBOARD

### Task B1: GetDashboardSummaryUseCase (TDD)
- [ ] Spec `src/domain/.../get-dashboard-summary.spec.ts` — NOTE: dashboard crosses contexts; place the use-case at `src/domain/dashboard/application/use-cases/get-dashboard-summary.ts`. It injects the EXISTING `ClientsRepository`, `ProductsRepository`, `BudgetsRepository` (sales) + `TicketsRepository` (support). spec uses the in-memory versions: seed a few of each; assert `stats` has 4 entries with numeric-ish values, `progress` present, `recentActivity` derived from tickets.
- [ ] Implement `get-dashboard-summary.ts`:
```ts
import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ClientsRepository } from '@/domain/sales/application/repositories/clients-repository'
import { ProductsRepository } from '@/domain/sales/application/repositories/products-repository'
import { BudgetsRepository } from '@/domain/sales/application/repositories/budgets-repository'
import { TicketsRepository } from '@/domain/support/application/repositories/tickets-repository'

export interface DashboardStat { title: string; value: string; icon: string; color: string; trend: string; trendValue: string }
export interface DashboardProgress { title: string; value: number; total: number; color: string; icon: string }
export interface DashboardActivity { action: string; user: string; time: string; type: string }
export interface DashboardSummary { stats: DashboardStat[]; progress: DashboardProgress[]; recentActivity: DashboardActivity[] }

type GetDashboardSummaryUseCaseResponse = Either<never, DashboardSummary>

@Injectable()
export class GetDashboardSummaryUseCase {
  constructor(
    private clientsRepository: ClientsRepository,
    private productsRepository: ProductsRepository,
    private budgetsRepository: BudgetsRepository,
    private ticketsRepository: TicketsRepository,
  ) {}

  async execute(): Promise<GetDashboardSummaryUseCaseResponse> {
    const clientsCount = await this.clientsRepository.count()
    const productsCount = await this.productsRepository.count()
    const budgetsCount = await this.budgetsRepository.count()
    const tickets = await this.ticketsRepository.findMany({})
    const ticketsCount = tickets.length
    const doneTickets = tickets.filter((t) => t.status === 'done').length

    const stats: DashboardStat[] = [
      { title: 'Clientes', value: String(clientsCount), icon: 'People', color: 'primary', trend: 'total', trendValue: '' },
      { title: 'Produtos', value: String(productsCount), icon: 'Inventory', color: 'success', trend: 'total', trendValue: '' },
      { title: 'Orçamentos', value: String(budgetsCount), icon: 'AttachMoney', color: 'warning', trend: 'total', trendValue: '' },
      { title: 'Chamados', value: String(ticketsCount), icon: 'Support', color: 'error', trend: 'total', trendValue: '' },
    ]

    const progress: DashboardProgress[] = [
      { title: 'Chamados Resolvidos', value: doneTickets, total: ticketsCount || 1, color: 'success', icon: 'Support' },
    ]

    const recentActivity: DashboardActivity[] = tickets.slice(0, 5).map((t) => ({
      action: `Chamado: ${t.title}`,
      user: t.assignee,
      time: t.createdAt.toISOString(),
      type: 'ticket',
    }))

    return right({ stats, progress, recentActivity })
  }
}
```
- [ ] Run → PASS. Commit `feat(backend): add GetDashboardSummaryUseCase (TDD)`.

### Task B2: Controller + wiring + gate
- [ ] `get-dashboard-summary.controller.ts`:
```ts
import { Controller, Get } from '@nestjs/common'
import { GetDashboardSummaryUseCase } from '@/domain/dashboard/application/use-cases/get-dashboard-summary'

@Controller('/dashboard/summary')
export class GetDashboardSummaryController {
  constructor(private getSummary: GetDashboardSummaryUseCase) {}

  @Get()
  async handle() {
    const result = await this.getSummary.execute()
    const { stats, progress, recentActivity } = result.value!
    return { stats, progress, recentActivity }
  }
}
```
- [ ] Register `GetDashboardSummaryController` + `GetDashboardSummaryUseCase` in `http.module.ts` (DatabaseModule already exports the needed repos).
- [ ] GATE: `pnpm prisma generate`; `pnpm test` (attachments 3 + dashboard 1 + existing 108 all pass); `pnpm build` → `dist/infra/main.js` exists. git clean.
- [ ] Commit `feat(backend): add GET /dashboard/summary endpoint`.

---

## Done Criteria
- F7b: `POST /tickets/:id/attachments` (multipart, validates type, uploads via Uploader, persists `Attachment`); upload use-case tested with a fake uploader.
- F8: `GET /dashboard/summary` returns `{ stats, progress, recentActivity }` aggregated from real repos.
- `pnpm test` + `pnpm build` + `pnpm prisma generate` pass.

## Next (F9/F10)
- **F9:** hardening (throttler on /sessions, finer indexes, e2e). **F10:** frontend integration (point `features/<domain>/api` at the real API, remove NextAuth).
