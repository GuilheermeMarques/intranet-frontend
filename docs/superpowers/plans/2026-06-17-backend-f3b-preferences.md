# Backend F3b — User Preferences Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Close the `iam` context with user preferences — `GET /me/preferences` and `PATCH /me/preferences` (theme, language, sidebarCollapsed), defaulting when none exist.

**Architecture:** DDD per spec, context `iam`. 1:1 `UserPreferences` per user. Lazy defaults (theme `light`, language `pt-BR`, sidebarCollapsed `false`) returned when none persisted; PATCH upserts.

**Tech Stack:** NestJS 10, Prisma, Vitest. pnpm. Builds on F3.

**Working dir:** repo root; backend `intranet-backend/`. Branch `feat/backend-f3b-preferences`.

**Env constraints:** No Docker. Gates: `pnpm test`, `pnpm prisma generate`, `pnpm build`. Migration/e2e **[needs Docker]**.

---

## Task 1: Entity + repository + in-memory repo

- [ ] `src/domain/iam/enterprise/entities/user-preferences.ts`:
```ts
import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface UserPreferencesProps {
  userId: UniqueEntityID
  theme: string
  language: string
  sidebarCollapsed: boolean
}

export class UserPreferences extends Entity<UserPreferencesProps> {
  get userId() { return this.props.userId }
  get theme() { return this.props.theme }
  get language() { return this.props.language }
  get sidebarCollapsed() { return this.props.sidebarCollapsed }

  set theme(value: string) { this.props.theme = value }
  set language(value: string) { this.props.language = value }
  set sidebarCollapsed(value: boolean) { this.props.sidebarCollapsed = value }

  static create(
    props: Optional<UserPreferencesProps, 'theme' | 'language' | 'sidebarCollapsed'>,
    id?: UniqueEntityID,
  ) {
    return new UserPreferences(
      {
        ...props,
        theme: props.theme ?? 'light',
        language: props.language ?? 'pt-BR',
        sidebarCollapsed: props.sidebarCollapsed ?? false,
      },
      id,
    )
  }
}
```
- [ ] `src/domain/iam/application/repositories/preferences-repository.ts`:
```ts
import { UserPreferences } from '../../enterprise/entities/user-preferences'

export abstract class PreferencesRepository {
  abstract findByUserId(userId: string): Promise<UserPreferences | null>
  abstract save(preferences: UserPreferences): Promise<void>
}
```
- [ ] `test/repositories/in-memory-preferences-repository.ts`:
```ts
import { PreferencesRepository } from '@/domain/iam/application/repositories/preferences-repository'
import { UserPreferences } from '@/domain/iam/enterprise/entities/user-preferences'

export class InMemoryPreferencesRepository implements PreferencesRepository {
  public items: UserPreferences[] = []

  async findByUserId(userId: string) {
    return this.items.find((item) => item.userId.toString() === userId) ?? null
  }

  async save(preferences: UserPreferences) {
    const index = this.items.findIndex((item) => item.userId.toString() === preferences.userId.toString())
    if (index >= 0) this.items[index] = preferences
    else this.items.push(preferences)
  }
}
```
- [ ] Commit `feat(backend): add UserPreferences entity, repository and in-memory repo`.

## Task 2: GetPreferences + UpdatePreferences use-cases (TDD)

- [ ] Write `src/domain/iam/application/use-cases/get-preferences.spec.ts`:
```ts
import { InMemoryPreferencesRepository } from 'test/repositories/in-memory-preferences-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserPreferences } from '@/domain/iam/enterprise/entities/user-preferences'
import { GetPreferencesUseCase } from './get-preferences'

let repo: InMemoryPreferencesRepository
let sut: GetPreferencesUseCase

describe('Get Preferences', () => {
  beforeEach(() => {
    repo = new InMemoryPreferencesRepository()
    sut = new GetPreferencesUseCase(repo)
  })

  it('returns stored preferences', async () => {
    repo.items.push(UserPreferences.create({ userId: new UniqueEntityID('u1'), theme: 'dark', language: 'en', sidebarCollapsed: true }))
    const result = await sut.execute({ userId: 'u1' })
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.preferences.theme).toBe('dark')
      expect(result.value.preferences.sidebarCollapsed).toBe(true)
    }
  })

  it('returns defaults when none exist', async () => {
    const result = await sut.execute({ userId: 'u2' })
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.preferences.theme).toBe('light')
      expect(result.value.preferences.language).toBe('pt-BR')
      expect(result.value.preferences.sidebarCollapsed).toBe(false)
    }
  })
})
```
- [ ] Run → FAIL. Implement `src/domain/iam/application/use-cases/get-preferences.ts`:
```ts
import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { PreferencesRepository } from '../repositories/preferences-repository'
import { UserPreferences } from '../../enterprise/entities/user-preferences'

interface GetPreferencesUseCaseRequest { userId: string }
type GetPreferencesUseCaseResponse = Either<never, { preferences: UserPreferences }>

@Injectable()
export class GetPreferencesUseCase {
  constructor(private preferencesRepository: PreferencesRepository) {}

  async execute({ userId }: GetPreferencesUseCaseRequest): Promise<GetPreferencesUseCaseResponse> {
    const existing = await this.preferencesRepository.findByUserId(userId)
    const preferences = existing ?? UserPreferences.create({ userId: new UniqueEntityID(userId) })
    return right({ preferences })
  }
}
```
- [ ] Run → PASS (2).
- [ ] Write `src/domain/iam/application/use-cases/update-preferences.spec.ts`:
```ts
import { InMemoryPreferencesRepository } from 'test/repositories/in-memory-preferences-repository'
import { UpdatePreferencesUseCase } from './update-preferences'

let repo: InMemoryPreferencesRepository
let sut: UpdatePreferencesUseCase

describe('Update Preferences', () => {
  beforeEach(() => {
    repo = new InMemoryPreferencesRepository()
    sut = new UpdatePreferencesUseCase(repo)
  })

  it('creates and persists preferences when none exist', async () => {
    const result = await sut.execute({ userId: 'u1', theme: 'dark' })
    expect(result.isRight()).toBe(true)
    if (result.isRight()) expect(result.value.preferences.theme).toBe('dark')
    expect(repo.items).toHaveLength(1)
    const stored = await repo.findByUserId('u1')
    expect(stored?.theme).toBe('dark')
  })

  it('patches only provided fields', async () => {
    await sut.execute({ userId: 'u1', theme: 'dark', language: 'en', sidebarCollapsed: true })
    const result = await sut.execute({ userId: 'u1', sidebarCollapsed: false })
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.preferences.theme).toBe('dark') // unchanged
      expect(result.value.preferences.language).toBe('en') // unchanged
      expect(result.value.preferences.sidebarCollapsed).toBe(false) // patched
    }
    expect(repo.items).toHaveLength(1)
  })
})
```
- [ ] Run → FAIL. Implement `src/domain/iam/application/use-cases/update-preferences.ts`:
```ts
import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { PreferencesRepository } from '../repositories/preferences-repository'
import { UserPreferences } from '../../enterprise/entities/user-preferences'

interface UpdatePreferencesUseCaseRequest {
  userId: string
  theme?: string
  language?: string
  sidebarCollapsed?: boolean
}

type UpdatePreferencesUseCaseResponse = Either<never, { preferences: UserPreferences }>

@Injectable()
export class UpdatePreferencesUseCase {
  constructor(private preferencesRepository: PreferencesRepository) {}

  async execute({ userId, theme, language, sidebarCollapsed }: UpdatePreferencesUseCaseRequest): Promise<UpdatePreferencesUseCaseResponse> {
    const preferences =
      (await this.preferencesRepository.findByUserId(userId)) ??
      UserPreferences.create({ userId: new UniqueEntityID(userId) })

    if (theme !== undefined) preferences.theme = theme
    if (language !== undefined) preferences.language = language
    if (sidebarCollapsed !== undefined) preferences.sidebarCollapsed = sidebarCollapsed

    await this.preferencesRepository.save(preferences)
    return right({ preferences })
  }
}
```
- [ ] Run → PASS (2). Commit `feat(backend): add get/update preferences use-cases (TDD)`.

## Task 3: Prisma — schema, mapper, repository, wiring

- [ ] Update `prisma/schema.prisma`: add `preferences UserPreferences?` to the `User` model (before `@@map`), and add:
```prisma
model UserPreferences {
  id               String    @id @default(uuid())
  userId           String    @unique @map("user_id")
  theme            String    @default("light")
  language         String    @default("pt-BR")
  sidebarCollapsed Boolean   @default(false) @map("sidebar_collapsed")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime? @updatedAt @map("updated_at")

  user User @relation(fields: [userId], references: [id])

  @@map("user_preferences")
}
```
- [ ] `pnpm prisma generate`.
- [ ] `src/infra/database/prisma/mappers/prisma-preferences-mapper.ts`:
```ts
import { UserPreferences as PrismaUserPreferences } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserPreferences } from '@/domain/iam/enterprise/entities/user-preferences'

export class PrismaPreferencesMapper {
  static toDomain(raw: PrismaUserPreferences): UserPreferences {
    return UserPreferences.create(
      {
        userId: new UniqueEntityID(raw.userId),
        theme: raw.theme,
        language: raw.language,
        sidebarCollapsed: raw.sidebarCollapsed,
      },
      new UniqueEntityID(raw.id),
    )
  }
}
```
- [ ] `src/infra/database/prisma/repositories/prisma-preferences-repository.ts`:
```ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PreferencesRepository } from '@/domain/iam/application/repositories/preferences-repository'
import { UserPreferences } from '@/domain/iam/enterprise/entities/user-preferences'
import { PrismaPreferencesMapper } from '../mappers/prisma-preferences-mapper'

@Injectable()
export class PrismaPreferencesRepository implements PreferencesRepository {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const found = await this.prisma.userPreferences.findUnique({ where: { userId } })
    return found ? PrismaPreferencesMapper.toDomain(found) : null
  }

  async save(preferences: UserPreferences): Promise<void> {
    const userId = preferences.userId.toString()
    await this.prisma.userPreferences.upsert({
      where: { userId },
      update: {
        theme: preferences.theme,
        language: preferences.language,
        sidebarCollapsed: preferences.sidebarCollapsed,
      },
      create: {
        userId,
        theme: preferences.theme,
        language: preferences.language,
        sidebarCollapsed: preferences.sidebarCollapsed,
      },
    })
  }
}
```
- [ ] Update `src/infra/database/database.module.ts` — provide/export `PreferencesRepository` (import `PreferencesRepository` + `PrismaPreferencesRepository`; add the provider and export).
- [ ] Commit `feat(backend): add preferences schema, mapper, repository and wiring`.

## Task 4: Controller + wiring

- [ ] `src/infra/http/presenters/preferences-presenter.ts`:
```ts
import { UserPreferences } from '@/domain/iam/enterprise/entities/user-preferences'

export class PreferencesPresenter {
  static toHTTP(preferences: UserPreferences) {
    return {
      theme: preferences.theme,
      language: preferences.language,
      sidebarCollapsed: preferences.sidebarCollapsed,
    }
  }
}
```
- [ ] `src/infra/http/controllers/preferences.controller.ts`:
```ts
import { Body, Controller, Get, Patch, UsePipes } from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { GetPreferencesUseCase } from '@/domain/iam/application/use-cases/get-preferences'
import { UpdatePreferencesUseCase } from '@/domain/iam/application/use-cases/update-preferences'
import { PreferencesPresenter } from '../presenters/preferences-presenter'

const updateBodySchema = z.object({
  theme: z.string().optional(),
  language: z.string().optional(),
  sidebarCollapsed: z.boolean().optional(),
})
type UpdateBodySchema = z.infer<typeof updateBodySchema>

@Controller('/me/preferences')
export class PreferencesController {
  constructor(
    private getPreferences: GetPreferencesUseCase,
    private updatePreferences: UpdatePreferencesUseCase,
  ) {}

  @Get()
  async get(@CurrentUser() currentUser: UserPayload) {
    const result = await this.getPreferences.execute({ userId: currentUser.sub })
    return { preferences: PreferencesPresenter.toHTTP(result.value!.preferences) }
  }

  @Patch()
  @UsePipes(new ZodValidationPipe(updateBodySchema))
  async patch(@CurrentUser() currentUser: UserPayload, @Body() body: UpdateBodySchema) {
    const result = await this.updatePreferences.execute({ userId: currentUser.sub, ...body })
    return { preferences: PreferencesPresenter.toHTTP(result.value!.preferences) }
  }
}
```
- [ ] Update `src/infra/http/http.module.ts` — add `PreferencesController` to controllers and `GetPreferencesUseCase`, `UpdatePreferencesUseCase` to providers.
- [ ] Commit `feat(backend): add /me/preferences endpoints`.

## Task 5: Gate

- [ ] `pnpm prisma generate` → success (UserPreferences present).
- [ ] `pnpm test` → all pass (get-preferences 2 + update-preferences 2 + existing 26 = green).
- [ ] `pnpm build` → success; `dist/infra/main.js` exists.
- [ ] `git status` clean; nothing gitignored staged.
- [ ] **[needs Docker]** `pnpm prisma migrate dev --name user_preferences`; `GET/PATCH /me/preferences` (bearer).

---

## Done Criteria
- `UserPreferences` entity/schema/repo; get/update use-cases (4 unit tests); `GET /me/preferences` + `PATCH /me/preferences` wired.
- `pnpm test` + `pnpm build` + `pnpm prisma generate` pass. **iam context complete.**

## Next (F4)
- **clients** — first business domain (`sales` context): CRUD + filters + `code` lookup + cities lookup.
