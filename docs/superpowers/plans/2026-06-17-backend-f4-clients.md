# Backend F4 — Clients (sales context) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** First business domain — clients CRUD + filters + lookups in the new `sales` bounded context, matching the frontend's English `Client` contract. Establishes the repeatable pattern for products/orders/budgets.

**Architecture:** DDD per spec `docs/superpowers/specs/2026-06-16-intranet-backend-design.md`, context `sales`. Use-cases return `Either`; unit specs use an in-memory repo. Endpoints (spec §7.2): `GET /clients` (filters → `{clients[], cities[]}`), `GET /clients/:id`, `GET /clients/code/:code`, `POST /clients`, `PATCH /clients/:id`, `DELETE /clients/:id`, `GET /clients/lookups` (→ `{cities[]}`). All protected (global `JwtAuthGuard`; no special permission required for F4).

**Frontend contract (target):** `Client { id, code, name, document, zipCode, street, city, state, neighborhood, number, complement, email, phone, instagram, lastPurchaseAt: string|null, purchaseCount: number }`. Filters: `code` (partial), `name` (partial), `city` (exact), `startDate`/`endDate` (range on `lastPurchaseAt`).

**Tech Stack:** NestJS 10, Prisma, Vitest. pnpm.

**Working dir:** repo root; backend `intranet-backend/`. Branch `feat/backend-f4-clients`.

**Env constraints:** No Docker. Gates: `pnpm test` (unit), `pnpm prisma generate`, `pnpm build`. Migration/e2e/seed-run **[needs Docker]**.

---

## Task 1: Client entity + repository + in-memory repo

- [ ] `src/domain/sales/enterprise/entities/client.ts`:
```ts
import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface ClientProps {
  code: string
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
  lastPurchaseAt?: Date | null
  purchaseCount: number
}

export class Client extends Entity<ClientProps> {
  get code() { return this.props.code }
  get name() { return this.props.name }
  get document() { return this.props.document }
  get zipCode() { return this.props.zipCode }
  get street() { return this.props.street }
  get city() { return this.props.city }
  get state() { return this.props.state }
  get neighborhood() { return this.props.neighborhood }
  get number() { return this.props.number }
  get complement() { return this.props.complement }
  get email() { return this.props.email }
  get phone() { return this.props.phone }
  get instagram() { return this.props.instagram }
  get lastPurchaseAt() { return this.props.lastPurchaseAt }
  get purchaseCount() { return this.props.purchaseCount }

  set name(v: string) { this.props.name = v }
  set document(v: string) { this.props.document = v }
  set zipCode(v: string) { this.props.zipCode = v }
  set street(v: string) { this.props.street = v }
  set city(v: string) { this.props.city = v }
  set state(v: string) { this.props.state = v }
  set neighborhood(v: string) { this.props.neighborhood = v }
  set number(v: string) { this.props.number = v }
  set complement(v: string) { this.props.complement = v }
  set email(v: string) { this.props.email = v }
  set phone(v: string) { this.props.phone = v }
  set instagram(v: string) { this.props.instagram = v }

  static create(
    props: Optional<ClientProps, 'lastPurchaseAt' | 'purchaseCount'>,
    id?: UniqueEntityID,
  ) {
    return new Client(
      { ...props, lastPurchaseAt: props.lastPurchaseAt ?? null, purchaseCount: props.purchaseCount ?? 0 },
      id,
    )
  }
}
```
- [ ] `src/domain/sales/application/repositories/clients-repository.ts`:
```ts
import { Client } from '../../enterprise/entities/client'

export interface ClientFilters {
  code?: string
  name?: string
  city?: string
  startDate?: Date | null
  endDate?: Date | null
}

export abstract class ClientsRepository {
  abstract findMany(filters: ClientFilters): Promise<Client[]>
  abstract findById(id: string): Promise<Client | null>
  abstract findByCode(code: string): Promise<Client | null>
  abstract findDistinctCities(): Promise<string[]>
  abstract count(): Promise<number>
  abstract create(client: Client): Promise<void>
  abstract save(client: Client): Promise<void>
  abstract delete(client: Client): Promise<void>
}
```
- [ ] `test/repositories/in-memory-clients-repository.ts`:
```ts
import { ClientFilters, ClientsRepository } from '@/domain/sales/application/repositories/clients-repository'
import { Client } from '@/domain/sales/enterprise/entities/client'

export class InMemoryClientsRepository implements ClientsRepository {
  public items: Client[] = []

  async findMany(filters: ClientFilters): Promise<Client[]> {
    return this.items.filter((client) => {
      if (filters.code?.trim() && !client.code.toLowerCase().includes(filters.code.toLowerCase())) return false
      if (filters.name?.trim() && !client.name.toLowerCase().includes(filters.name.toLowerCase())) return false
      if (filters.city?.trim() && client.city !== filters.city) return false
      if (filters.startDate && (!client.lastPurchaseAt || client.lastPurchaseAt < filters.startDate)) return false
      if (filters.endDate && (!client.lastPurchaseAt || client.lastPurchaseAt > filters.endDate)) return false
      return true
    })
  }

  async findById(id: string) {
    return this.items.find((c) => c.id.toString() === id) ?? null
  }

  async findByCode(code: string) {
    return this.items.find((c) => c.code === code) ?? null
  }

  async findDistinctCities() {
    return [...new Set(this.items.map((c) => c.city))].sort()
  }

  async count() {
    return this.items.length
  }

  async create(client: Client) {
    this.items.push(client)
  }

  async save(client: Client) {
    const index = this.items.findIndex((c) => c.id.equals(client.id))
    if (index >= 0) this.items[index] = client
  }

  async delete(client: Client) {
    this.items = this.items.filter((c) => !c.id.equals(client.id))
  }
}
```
- [ ] Commit `feat(backend): add Client entity, repository and in-memory repo`.

## Task 2: Read use-cases — FetchClients, GetClientById, GetClientByCode, FetchCities (TDD)

- [ ] `fetch-clients.spec.ts` (push 3 clients with different city/name; assert filter by name + that `cities` is the distinct sorted set). Implement `fetch-clients.ts`:
```ts
import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ClientFilters, ClientsRepository } from '../repositories/clients-repository'
import { Client } from '../../enterprise/entities/client'

interface FetchClientsUseCaseRequest { filters: ClientFilters }
type FetchClientsUseCaseResponse = Either<never, { clients: Client[]; cities: string[] }>

@Injectable()
export class FetchClientsUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({ filters }: FetchClientsUseCaseRequest): Promise<FetchClientsUseCaseResponse> {
    const clients = await this.clientsRepository.findMany(filters)
    const cities = await this.clientsRepository.findDistinctCities()
    return right({ clients, cities })
  }
}
```
- [ ] `get-client-by-id.spec.ts` (found / ResourceNotFoundError). Implement `get-client-by-id.ts`:
```ts
import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { ClientsRepository } from '../repositories/clients-repository'
import { Client } from '../../enterprise/entities/client'

interface GetClientByIdUseCaseRequest { id: string }
type GetClientByIdUseCaseResponse = Either<ResourceNotFoundError, { client: Client }>

@Injectable()
export class GetClientByIdUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({ id }: GetClientByIdUseCaseRequest): Promise<GetClientByIdUseCaseResponse> {
    const client = await this.clientsRepository.findById(id)
    if (!client) return left(new ResourceNotFoundError())
    return right({ client })
  }
}
```
- [ ] `get-client-by-code.spec.ts` + `get-client-by-code.ts` (same shape, `findByCode`).
- [ ] `fetch-cities.spec.ts` + `fetch-cities.ts`:
```ts
import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ClientsRepository } from '../repositories/clients-repository'

type FetchCitiesUseCaseResponse = Either<never, { cities: string[] }>

@Injectable()
export class FetchCitiesUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute(): Promise<FetchCitiesUseCaseResponse> {
    const cities = await this.clientsRepository.findDistinctCities()
    return right({ cities })
  }
}
```
- [ ] Each: spec FIRST → FAIL → implement → PASS. Commit `feat(backend): add client read use-cases (fetch, by-id, by-code, cities) (TDD)`.

## Task 3: Write use-cases — CreateClient, EditClient, DeleteClient (TDD)

- [ ] `create-client.spec.ts` (auto-generates a `CLI###` code; defaults lastPurchaseAt null + purchaseCount 0). Implement `create-client.ts`:
```ts
import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ClientsRepository } from '../repositories/clients-repository'
import { Client } from '../../enterprise/entities/client'

interface CreateClientUseCaseRequest {
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

type CreateClientUseCaseResponse = Either<never, { client: Client }>

@Injectable()
export class CreateClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute(data: CreateClientUseCaseRequest): Promise<CreateClientUseCaseResponse> {
    const count = await this.clientsRepository.count()
    const code = `CLI${String(count + 1).padStart(3, '0')}`

    const client = Client.create({ ...data, code })
    await this.clientsRepository.create(client)

    return right({ client })
  }
}
```
- [ ] `edit-client.spec.ts` (patches fields; ResourceNotFoundError when missing). Implement `edit-client.ts`:
```ts
import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { ClientsRepository } from '../repositories/clients-repository'
import { Client } from '../../enterprise/entities/client'

interface EditClientUseCaseRequest {
  id: string
  name?: string
  document?: string
  zipCode?: string
  street?: string
  city?: string
  state?: string
  neighborhood?: string
  number?: string
  complement?: string
  email?: string
  phone?: string
  instagram?: string
}

type EditClientUseCaseResponse = Either<ResourceNotFoundError, { client: Client }>

@Injectable()
export class EditClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({ id, ...data }: EditClientUseCaseRequest): Promise<EditClientUseCaseResponse> {
    const client = await this.clientsRepository.findById(id)
    if (!client) return left(new ResourceNotFoundError())

    if (data.name !== undefined) client.name = data.name
    if (data.document !== undefined) client.document = data.document
    if (data.zipCode !== undefined) client.zipCode = data.zipCode
    if (data.street !== undefined) client.street = data.street
    if (data.city !== undefined) client.city = data.city
    if (data.state !== undefined) client.state = data.state
    if (data.neighborhood !== undefined) client.neighborhood = data.neighborhood
    if (data.number !== undefined) client.number = data.number
    if (data.complement !== undefined) client.complement = data.complement
    if (data.email !== undefined) client.email = data.email
    if (data.phone !== undefined) client.phone = data.phone
    if (data.instagram !== undefined) client.instagram = data.instagram

    await this.clientsRepository.save(client)
    return right({ client })
  }
}
```
- [ ] `delete-client.spec.ts` (deletes; ResourceNotFoundError when missing). Implement `delete-client.ts`:
```ts
import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { ClientsRepository } from '../repositories/clients-repository'

interface DeleteClientUseCaseRequest { id: string }
type DeleteClientUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class DeleteClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({ id }: DeleteClientUseCaseRequest): Promise<DeleteClientUseCaseResponse> {
    const client = await this.clientsRepository.findById(id)
    if (!client) return left(new ResourceNotFoundError())
    await this.clientsRepository.delete(client)
    return right(null)
  }
}
```
- [ ] Each spec FIRST → FAIL → implement → PASS. Commit `feat(backend): add client write use-cases (create, edit, delete) (TDD)`.

## Task 4: Prisma — schema, mapper, repository, wiring

- [ ] Add to `prisma/schema.prisma`:
```prisma
model Client {
  id             String    @id @default(uuid())
  code           String    @unique
  name           String
  document       String
  zipCode        String    @map("zip_code")
  street         String
  city           String
  state          String
  neighborhood   String
  number         String
  complement     String
  email          String
  phone          String
  instagram      String
  lastPurchaseAt DateTime? @map("last_purchase_at")
  purchaseCount  Int       @default(0) @map("purchase_count")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime? @updatedAt @map("updated_at")

  @@index([name])
  @@index([city])
  @@map("clients")
}
```
- [ ] `pnpm prisma generate`.
- [ ] `src/infra/database/prisma/mappers/prisma-client-mapper.ts`:
```ts
import { Client as PrismaClientModel, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Client } from '@/domain/sales/enterprise/entities/client'

export class PrismaClientMapper {
  static toDomain(raw: PrismaClientModel): Client {
    return Client.create(
      {
        code: raw.code,
        name: raw.name,
        document: raw.document,
        zipCode: raw.zipCode,
        street: raw.street,
        city: raw.city,
        state: raw.state,
        neighborhood: raw.neighborhood,
        number: raw.number,
        complement: raw.complement,
        email: raw.email,
        phone: raw.phone,
        instagram: raw.instagram,
        lastPurchaseAt: raw.lastPurchaseAt,
        purchaseCount: raw.purchaseCount,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(client: Client): Prisma.ClientUncheckedCreateInput {
    return {
      id: client.id.toString(),
      code: client.code,
      name: client.name,
      document: client.document,
      zipCode: client.zipCode,
      street: client.street,
      city: client.city,
      state: client.state,
      neighborhood: client.neighborhood,
      number: client.number,
      complement: client.complement,
      email: client.email,
      phone: client.phone,
      instagram: client.instagram,
      lastPurchaseAt: client.lastPurchaseAt ?? null,
      purchaseCount: client.purchaseCount,
    }
  }
}
```
- [ ] `src/infra/database/prisma/repositories/prisma-clients-repository.ts`:
```ts
import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { ClientFilters, ClientsRepository } from '@/domain/sales/application/repositories/clients-repository'
import { Client } from '@/domain/sales/enterprise/entities/client'
import { PrismaClientMapper } from '../mappers/prisma-client-mapper'

@Injectable()
export class PrismaClientsRepository implements ClientsRepository {
  constructor(private prisma: PrismaService) {}

  async findMany(filters: ClientFilters): Promise<Client[]> {
    const where: Prisma.ClientWhereInput = {}
    if (filters.code?.trim()) where.code = { contains: filters.code, mode: 'insensitive' }
    if (filters.name?.trim()) where.name = { contains: filters.name, mode: 'insensitive' }
    if (filters.city?.trim()) where.city = filters.city
    if (filters.startDate || filters.endDate) {
      where.lastPurchaseAt = {}
      if (filters.startDate) where.lastPurchaseAt.gte = filters.startDate
      if (filters.endDate) where.lastPurchaseAt.lte = filters.endDate
    }

    const rows = await this.prisma.client.findMany({ where, orderBy: { name: 'asc' } })
    return rows.map(PrismaClientMapper.toDomain)
  }

  async findById(id: string): Promise<Client | null> {
    const row = await this.prisma.client.findUnique({ where: { id } })
    return row ? PrismaClientMapper.toDomain(row) : null
  }

  async findByCode(code: string): Promise<Client | null> {
    const row = await this.prisma.client.findUnique({ where: { code } })
    return row ? PrismaClientMapper.toDomain(row) : null
  }

  async findDistinctCities(): Promise<string[]> {
    const rows = await this.prisma.client.findMany({
      distinct: ['city'],
      select: { city: true },
      orderBy: { city: 'asc' },
    })
    return rows.map((r) => r.city)
  }

  async count(): Promise<number> {
    return this.prisma.client.count()
  }

  async create(client: Client): Promise<void> {
    await this.prisma.client.create({ data: PrismaClientMapper.toPrisma(client) })
  }

  async save(client: Client): Promise<void> {
    const data = PrismaClientMapper.toPrisma(client)
    await this.prisma.client.update({ where: { id: data.id as string }, data })
  }

  async delete(client: Client): Promise<void> {
    await this.prisma.client.delete({ where: { id: client.id.toString() } })
  }
}
```
- [ ] Update `src/infra/database/database.module.ts` — provide/export `ClientsRepository` → `PrismaClientsRepository`.
- [ ] Commit `feat(backend): add clients schema, mapper, repository and wiring`.

## Task 5: Presenter + controllers + wiring

- [ ] `src/infra/http/presenters/client-presenter.ts`:
```ts
import { Client } from '@/domain/sales/enterprise/entities/client'

export class ClientPresenter {
  static toHTTP(client: Client) {
    return {
      id: client.id.toString(),
      code: client.code,
      name: client.name,
      document: client.document,
      zipCode: client.zipCode,
      street: client.street,
      city: client.city,
      state: client.state,
      neighborhood: client.neighborhood,
      number: client.number,
      complement: client.complement,
      email: client.email,
      phone: client.phone,
      instagram: client.instagram,
      lastPurchaseAt: client.lastPurchaseAt ? client.lastPurchaseAt.toISOString() : null,
      purchaseCount: client.purchaseCount,
    }
  }
}
```
- [ ] Create one controller per route under `src/infra/http/controllers/`. Use a shared Zod body schema for create/edit. Routes + the use-case each calls:
  - `fetch-clients.controller.ts` — `@Controller('/clients')` `@Get()` with query params (code, name, city, startDate, endDate via a Zod query pipe or `@Query()`), calls `FetchClientsUseCase`, returns `{ clients: rows.map(ClientPresenter.toHTTP), cities }`.
  - `get-client-by-code.controller.ts` — `@Controller('/clients/code/:code')` `@Get()` → `GetClientByCodeUseCase`; `Left` → `NotFoundException`; returns `{ client }`.
  - `get-client-lookups.controller.ts` — `@Controller('/clients/lookups')` `@Get()` → `FetchCitiesUseCase`; returns `{ cities }`.
  - `get-client-by-id.controller.ts` — `@Controller('/clients/:id')` `@Get()` → `GetClientByIdUseCase`; returns `{ client }`.
  - `create-client.controller.ts` — `@Controller('/clients')` `@Post()` with the create Zod body; returns `{ client }`.
  - `edit-client.controller.ts` — `@Controller('/clients/:id')` `@Patch()` with the edit Zod body; `Left` → `NotFoundException`; returns `{ client }`.
  - `delete-client.controller.ts` — `@Controller('/clients/:id')` `@Delete()` `@HttpCode(204)`; `Left` → `NotFoundException`.

  ROUTING ORDER NOTE: register the static-path controllers (`/clients/code/:code`, `/clients/lookups`) and the `/clients/:id` controllers as SEPARATE controllers. To avoid `/clients/lookups` being captured by `/clients/:id`, in `http.module.ts` list `GetClientLookupsController` and `GetClientByCodeController` BEFORE `GetClientByIdController`. (Nest matches in declaration order for same-prefix params.)

  Create body Zod schema (shared, in a small file `src/infra/http/controllers/schemas/client-body-schema.ts` or inline per controller — inline is fine):
  ```ts
  const createClientBodySchema = z.object({
    name: z.string(),
    document: z.string(),
    zipCode: z.string(),
    street: z.string(),
    city: z.string(),
    state: z.string(),
    neighborhood: z.string(),
    number: z.string(),
    complement: z.string(),
    email: z.string().email(),
    phone: z.string(),
    instagram: z.string(),
  })
  ```
  Edit schema = `createClientBodySchema.partial()`.
  For the GET list query, parse with a Zod schema: `{ code?, name?, city?, startDate?, endDate? }` where startDate/endDate are `z.coerce.date().optional()`.

- [ ] Update `src/infra/http/http.module.ts` — register all 7 client controllers (in the order noted) and the 7 client use-cases as providers. DatabaseModule already exports ClientsRepository after Task 4.
- [ ] Commit `feat(backend): add clients endpoints (CRUD + filters + lookups)`.

## Task 6: Seed clients (optional but recommended) + Gate

- [ ] (Optional) extend `prisma/seed.ts` to upsert a handful of clients from the frontend mock shape (e.g. 3 clients with codes CLI001–CLI003) so the list isn't empty. Use `upsert` keyed on `code`. Keep it minimal.
- [ ] GATE: `pnpm prisma generate`; `pnpm test` (all unit specs pass — fetch/by-id/by-code/cities + create/edit/delete + existing 30); `pnpm build` → `dist/infra/main.js` exists.
- [ ] `git status` clean; nothing gitignored staged.
- [ ] **[needs Docker]** `pnpm prisma migrate dev --name clients`; exercise `GET /clients`, `POST /clients`, `PATCH /clients/:id`, `DELETE /clients/:id`, `GET /clients/code/:code`, `GET /clients/lookups` with a bearer token.
- [ ] Commit `feat(backend): seed sample clients` (if seed extended) / or fold into Task 5.

---

## Done Criteria
- `Client` entity/schema/repo (sales context); 7 use-cases with passing unit tests.
- 7 endpoints wired (`GET /clients`, `GET /clients/:id`, `GET /clients/code/:code`, `GET /clients/lookups`, `POST`, `PATCH`, `DELETE`), returning the frontend's English `Client` shape.
- `pnpm test` + `pnpm build` + `pnpm prisma generate` pass.

## Next (F5)
- **products + inventory** — replicate this pattern in the `sales` context.
