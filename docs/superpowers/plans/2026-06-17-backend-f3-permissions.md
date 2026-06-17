# Backend F3 — Permissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Permissions domain that unblocks the frontend's permission-driven navigation and the `/settings/permissions` admin screen — `GET /me` with `permissions[]`, the users/permissions admin endpoints, `PermissionsGuard` + `@RequirePermissions`, and a seeded permission catalog assigned to the admin.

**Architecture:** DDD per spec `docs/superpowers/specs/2026-06-16-intranet-backend-design.md`, context `iam`. A user's permissions are resolved as `string[]` of permission keys (join `user_permissions` → `permissions`). One `PermissionsRepository` handles catalog + per-user resolution + assignment. `PermissionsGuard` (second global guard, runs after `JwtAuthGuard`) enforces `@RequirePermissions` only where present.

**Scope:** permissions only. **Deferred to F3b:** preferences (`UserPreferences`, `GET/PATCH /me/preferences`).

**Tech Stack:** NestJS 10, Prisma, Vitest. pnpm. Builds on F2/F2b.

**Working dir:** repo root; backend `intranet-backend/`. Branch `feat/backend-f3-permissions`.

**Env constraints:** No Docker/Postgres. Gates here: `pnpm test` (unit), `pnpm prisma generate`, `pnpm build`. Migration/e2e/seed-run are **[needs Docker]**.

**Permission catalog (13 keys)** used by seed + GET /permissions:
`settings.permissions.manage` (admin), and menu keys: `menu.dashboard, menu.catalog, menu.clients, menu.tickets, menu.tickets.list, menu.tickets.priorities, menu.tickets.tags, menu.budgets, menu.inventory, menu.sales, menu.sales.representatives, menu.sales.orders`.

---

## Task 1: Permission entity + repository, extend UsersRepository

- [ ] Create `src/domain/iam/enterprise/entities/permission.ts`:
```ts
import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface PermissionProps {
  key: string
  name: string
  description?: string | null
  category?: string | null
}

export class Permission extends Entity<PermissionProps> {
  get key() { return this.props.key }
  get name() { return this.props.name }
  get description() { return this.props.description }
  get category() { return this.props.category }

  static create(props: PermissionProps, id?: UniqueEntityID) {
    return new Permission(props, id)
  }
}
```
- [ ] Create `src/domain/iam/application/repositories/permissions-repository.ts`:
```ts
import { Permission } from '../../enterprise/entities/permission'

export abstract class PermissionsRepository {
  abstract findManyCatalog(): Promise<Permission[]>
  abstract findKeysByUserId(userId: string): Promise<string[]>
  abstract replaceUserPermissions(userId: string, permissionKeys: string[]): Promise<void>
}
```
- [ ] Extend `src/domain/iam/application/repositories/users-repository.ts` — add `findMany`:
```ts
import { User } from '../../enterprise/entities/user'

export abstract class UsersRepository {
  abstract findByEmail(email: string): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
  abstract findMany(): Promise<User[]>
  abstract create(user: User): Promise<void>
}
```
- [ ] Update `test/repositories/in-memory-users-repository.ts` — add `findMany`:
```ts
  async findMany() {
    return [...this.items]
  }
```
  (insert before `create`).
- [ ] Create `test/repositories/in-memory-permissions-repository.ts`:
```ts
import { PermissionsRepository } from '@/domain/iam/application/repositories/permissions-repository'
import { Permission } from '@/domain/iam/enterprise/entities/permission'

export class InMemoryPermissionsRepository implements PermissionsRepository {
  public catalog: Permission[] = []
  public assignments: { userId: string; key: string }[] = []

  async findManyCatalog() {
    return [...this.catalog]
  }

  async findKeysByUserId(userId: string) {
    return this.assignments.filter((a) => a.userId === userId).map((a) => a.key)
  }

  async replaceUserPermissions(userId: string, permissionKeys: string[]) {
    this.assignments = this.assignments.filter((a) => a.userId !== userId)
    for (const key of permissionKeys) {
      this.assignments.push({ userId, key })
    }
  }
}
```
- [ ] Commit `feat(backend): add Permission entity, repository, extend UsersRepository`.

## Task 2: Read use-cases — GetMe, GetUserPermissions, GetPermissionsCatalog, ListUsers (TDD)

- [ ] Write failing spec `src/domain/iam/application/use-cases/get-me.spec.ts`:
```ts
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { InMemoryPermissionsRepository } from 'test/repositories/in-memory-permissions-repository'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { GetMeUseCase } from './get-me'

let usersRepository: InMemoryUsersRepository
let permissionsRepository: InMemoryPermissionsRepository
let sut: GetMeUseCase

describe('Get Me', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    permissionsRepository = new InMemoryPermissionsRepository()
    sut = new GetMeUseCase(usersRepository, permissionsRepository)
  })

  it('returns the user and their permission keys', async () => {
    const user = makeUser({}, new UniqueEntityID('user-1'))
    usersRepository.items.push(user)
    permissionsRepository.assignments.push({ userId: 'user-1', key: 'menu.dashboard' })

    const result = await sut.execute({ userId: 'user-1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.user.id.toString()).toBe('user-1')
      expect(result.value.permissions).toEqual(['menu.dashboard'])
    }
  })

  it('returns ResourceNotFoundError for an unknown user', async () => {
    const result = await sut.execute({ userId: 'nope' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
```
- [ ] Run → FAIL. Implement `src/domain/iam/application/use-cases/get-me.ts`:
```ts
import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UsersRepository } from '../repositories/users-repository'
import { PermissionsRepository } from '../repositories/permissions-repository'
import { User } from '../../enterprise/entities/user'

interface GetMeUseCaseRequest {
  userId: string
}

type GetMeUseCaseResponse = Either<ResourceNotFoundError, { user: User; permissions: string[] }>

@Injectable()
export class GetMeUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private permissionsRepository: PermissionsRepository,
  ) {}

  async execute({ userId }: GetMeUseCaseRequest): Promise<GetMeUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) return left(new ResourceNotFoundError())

    const permissions = await this.permissionsRepository.findKeysByUserId(userId)
    return right({ user, permissions })
  }
}
```
- [ ] Run → PASS (2).
- [ ] Implement `src/domain/iam/application/use-cases/get-user-permissions.ts` (with spec `get-user-permissions.spec.ts` first → FAIL → PASS):
  - spec: seed a user + 2 assignments, assert `{ permissions: [...] }`; unknown user → `ResourceNotFoundError`.
```ts
import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UsersRepository } from '../repositories/users-repository'
import { PermissionsRepository } from '../repositories/permissions-repository'

interface GetUserPermissionsUseCaseRequest { userId: string }
type GetUserPermissionsUseCaseResponse = Either<ResourceNotFoundError, { permissions: string[] }>

@Injectable()
export class GetUserPermissionsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private permissionsRepository: PermissionsRepository,
  ) {}

  async execute({ userId }: GetUserPermissionsUseCaseRequest): Promise<GetUserPermissionsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) return left(new ResourceNotFoundError())
    const permissions = await this.permissionsRepository.findKeysByUserId(userId)
    return right({ permissions })
  }
}
```
  matching spec `src/domain/iam/application/use-cases/get-user-permissions.spec.ts`:
```ts
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { InMemoryPermissionsRepository } from 'test/repositories/in-memory-permissions-repository'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { GetUserPermissionsUseCase } from './get-user-permissions'

let usersRepository: InMemoryUsersRepository
let permissionsRepository: InMemoryPermissionsRepository
let sut: GetUserPermissionsUseCase

describe('Get User Permissions', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    permissionsRepository = new InMemoryPermissionsRepository()
    sut = new GetUserPermissionsUseCase(usersRepository, permissionsRepository)
  })

  it('returns the permission keys of a user', async () => {
    usersRepository.items.push(makeUser({}, new UniqueEntityID('u1')))
    permissionsRepository.assignments.push({ userId: 'u1', key: 'menu.clients' })
    permissionsRepository.assignments.push({ userId: 'u1', key: 'menu.budgets' })

    const result = await sut.execute({ userId: 'u1' })
    expect(result.isRight()).toBe(true)
    if (result.isRight()) expect(result.value.permissions.sort()).toEqual(['menu.budgets', 'menu.clients'])
  })

  it('returns ResourceNotFoundError for an unknown user', async () => {
    const result = await sut.execute({ userId: 'nope' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
```
- [ ] Implement `src/domain/iam/application/use-cases/get-permissions-catalog.ts` (+ spec → FAIL → PASS):
```ts
import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { PermissionsRepository } from '../repositories/permissions-repository'
import { Permission } from '../../enterprise/entities/permission'

type GetPermissionsCatalogUseCaseResponse = Either<never, { permissions: Permission[] }>

@Injectable()
export class GetPermissionsCatalogUseCase {
  constructor(private permissionsRepository: PermissionsRepository) {}

  async execute(): Promise<GetPermissionsCatalogUseCaseResponse> {
    const permissions = await this.permissionsRepository.findManyCatalog()
    return right({ permissions })
  }
}
```
  spec `get-permissions-catalog.spec.ts`: push 2 Permission entities into `permissionsRepository.catalog`, assert `result.value.permissions` length 2.
- [ ] Implement `src/domain/iam/application/use-cases/list-users.ts` (+ spec → FAIL → PASS):
```ts
import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/users-repository'
import { PermissionsRepository } from '../repositories/permissions-repository'
import { User } from '../../enterprise/entities/user'

type ListUsersUseCaseResponse = Either<never, { users: { user: User; permissions: string[] }[] }>

@Injectable()
export class ListUsersUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private permissionsRepository: PermissionsRepository,
  ) {}

  async execute(): Promise<ListUsersUseCaseResponse> {
    const users = await this.usersRepository.findMany()
    const result = await Promise.all(
      users.map(async (user) => ({
        user,
        permissions: await this.permissionsRepository.findKeysByUserId(user.id.toString()),
      })),
    )
    return right({ users: result })
  }
}
```
  spec `list-users.spec.ts`: push 2 users + some assignments, assert `result.value.users` length 2 and each has a `permissions` array.
- [ ] Commit `feat(backend): add permission read use-cases (get-me, get-user-permissions, catalog, list-users) (TDD)`.

## Task 3: SetUserPermissions use-case (TDD)

- [ ] Write failing spec `src/domain/iam/application/use-cases/set-user-permissions.spec.ts`:
```ts
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { InMemoryPermissionsRepository } from 'test/repositories/in-memory-permissions-repository'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { SetUserPermissionsUseCase } from './set-user-permissions'

let usersRepository: InMemoryUsersRepository
let permissionsRepository: InMemoryPermissionsRepository
let sut: SetUserPermissionsUseCase

describe('Set User Permissions', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    permissionsRepository = new InMemoryPermissionsRepository()
    sut = new SetUserPermissionsUseCase(usersRepository, permissionsRepository)
  })

  it('replaces a user permission set', async () => {
    usersRepository.items.push(makeUser({}, new UniqueEntityID('u1')))
    permissionsRepository.assignments.push({ userId: 'u1', key: 'old.key' })

    const result = await sut.execute({ userId: 'u1', permissions: ['menu.dashboard', 'menu.clients'] })

    expect(result.isRight()).toBe(true)
    const keys = await permissionsRepository.findKeysByUserId('u1')
    expect(keys.sort()).toEqual(['menu.clients', 'menu.dashboard'])
  })

  it('returns ResourceNotFoundError for an unknown user', async () => {
    const result = await sut.execute({ userId: 'nope', permissions: [] })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
```
- [ ] Run → FAIL. Implement `src/domain/iam/application/use-cases/set-user-permissions.ts`:
```ts
import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UsersRepository } from '../repositories/users-repository'
import { PermissionsRepository } from '../repositories/permissions-repository'

interface SetUserPermissionsUseCaseRequest {
  userId: string
  permissions: string[]
}

type SetUserPermissionsUseCaseResponse = Either<ResourceNotFoundError, { permissions: string[] }>

@Injectable()
export class SetUserPermissionsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private permissionsRepository: PermissionsRepository,
  ) {}

  async execute({ userId, permissions }: SetUserPermissionsUseCaseRequest): Promise<SetUserPermissionsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) return left(new ResourceNotFoundError())

    await this.permissionsRepository.replaceUserPermissions(userId, permissions)
    return right({ permissions })
  }
}
```
- [ ] Run → PASS (2). Commit `feat(backend): add SetUserPermissionsUseCase (TDD)`.

## Task 4: PermissionsGuard + @RequirePermissions

- [ ] Create `src/infra/auth/require-permissions.decorator.ts`:
```ts
import { SetMetadata } from '@nestjs/common'

export const REQUIRE_PERMISSIONS_KEY = 'requirePermissions'
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, permissions)
```
- [ ] Create `src/infra/auth/permissions.guard.ts`:
```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PermissionsRepository } from '@/domain/iam/application/repositories/permissions-repository'
import { REQUIRE_PERMISSIONS_KEY } from './require-permissions.decorator'
import { UserPayload } from './jwt.strategy'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsRepository: PermissionsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRE_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!required || required.length === 0) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user as UserPayload | undefined
    if (!user) return false

    const keys = await this.permissionsRepository.findKeysByUserId(user.sub)
    return required.every((permission) => keys.includes(permission))
  }
}
```
  (The guard is registered as a second global `APP_GUARD` in HttpModule, Task 6 — it runs after `JwtAuthGuard` so `request.user` is set, and only enforces when `@RequirePermissions` is present.)
- [ ] Commit `feat(backend): add PermissionsGuard and @RequirePermissions`.

## Task 5: Prisma — schema, mapper, repository, wiring

- [ ] Update `prisma/schema.prisma`: add `userPermissions UserPermission[]` to the `User` model (before `@@map`), and add:
```prisma
model Permission {
  id          String   @id @default(uuid())
  key         String   @unique
  name        String
  description String?
  category    String?
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime? @updatedAt @map("updated_at")

  userPermissions UserPermission[]

  @@map("permissions")
}

model UserPermission {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  permissionId String   @map("permission_id")
  createdAt    DateTime @default(now()) @map("created_at")

  user       User       @relation(fields: [userId], references: [id])
  permission Permission @relation(fields: [permissionId], references: [id])

  @@unique([userId, permissionId])
  @@map("user_permissions")
}
```
- [ ] `pnpm prisma generate`.
- [ ] Create `src/infra/database/prisma/mappers/prisma-permission-mapper.ts`:
```ts
import { Permission as PrismaPermission } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Permission } from '@/domain/iam/enterprise/entities/permission'

export class PrismaPermissionMapper {
  static toDomain(raw: PrismaPermission): Permission {
    return Permission.create(
      { key: raw.key, name: raw.name, description: raw.description, category: raw.category },
      new UniqueEntityID(raw.id),
    )
  }
}
```
- [ ] Create `src/infra/database/prisma/repositories/prisma-permissions-repository.ts`:
```ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PermissionsRepository } from '@/domain/iam/application/repositories/permissions-repository'
import { Permission } from '@/domain/iam/enterprise/entities/permission'
import { PrismaPermissionMapper } from '../mappers/prisma-permission-mapper'

@Injectable()
export class PrismaPermissionsRepository implements PermissionsRepository {
  constructor(private prisma: PrismaService) {}

  async findManyCatalog(): Promise<Permission[]> {
    const rows = await this.prisma.permission.findMany({ orderBy: { key: 'asc' } })
    return rows.map(PrismaPermissionMapper.toDomain)
  }

  async findKeysByUserId(userId: string): Promise<string[]> {
    const rows = await this.prisma.userPermission.findMany({
      where: { userId },
      include: { permission: true },
    })
    return rows.map((row) => row.permission.key)
  }

  async replaceUserPermissions(userId: string, permissionKeys: string[]): Promise<void> {
    const permissions = await this.prisma.permission.findMany({
      where: { key: { in: permissionKeys } },
    })

    await this.prisma.$transaction([
      this.prisma.userPermission.deleteMany({ where: { userId } }),
      this.prisma.userPermission.createMany({
        data: permissions.map((permission) => ({ userId, permissionId: permission.id })),
        skipDuplicates: true,
      }),
    ])
  }
}
```
- [ ] Update `src/infra/database/prisma/repositories/prisma-users-repository.ts` — add `findMany`:
```ts
  async findMany(): Promise<User[]> {
    const users = await this.prisma.user.findMany({ orderBy: { name: 'asc' } })
    return users.map(PrismaUserMapper.toDomain)
  }
```
  (insert before `create`).
- [ ] Update `src/infra/database/database.module.ts` to provide/export `PermissionsRepository`:
  - import `PermissionsRepository` + `PrismaPermissionsRepository`; add `{ provide: PermissionsRepository, useClass: PrismaPermissionsRepository }` to providers and `PermissionsRepository` to exports.
- [ ] Commit `feat(backend): add permissions schema, mapper, repository and wiring`.

## Task 6: Presenters + controllers + register PermissionsGuard

- [ ] Create `src/infra/http/presenters/user-presenter.ts`:
```ts
import { User } from '@/domain/iam/enterprise/entities/user'

export class UserPresenter {
  static toHTTP(user: User, permissions: string[]) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      jobTitle: user.jobTitle ?? null,
      department: user.department ?? null,
      avatar: user.avatar ?? null,
      permissions,
    }
  }
}
```
- [ ] Create `src/infra/http/presenters/access-control-user-presenter.ts`:
```ts
import { User } from '@/domain/iam/enterprise/entities/user'

export class AccessControlUserPresenter {
  static toHTTP(user: User, permissions: string[]) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      jobTitle: user.jobTitle ?? null,
      department: user.department ?? null,
      status: user.isActive ? 'active' : 'inactive',
      lastLogin: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      avatar: user.avatar ?? null,
      permissions,
    }
  }
}
```
- [ ] Create `src/infra/http/presenters/permission-presenter.ts`:
```ts
import { Permission } from '@/domain/iam/enterprise/entities/permission'

export class PermissionPresenter {
  static toHTTP(permission: Permission) {
    return {
      key: permission.key,
      name: permission.name,
      description: permission.description ?? null,
      category: permission.category ?? null,
    }
  }
}
```
- [ ] Create `src/infra/http/controllers/get-me.controller.ts`:
```ts
import { Controller, Get, NotFoundException } from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { GetMeUseCase } from '@/domain/iam/application/use-cases/get-me'
import { UserPresenter } from '../presenters/user-presenter'

@Controller('/me')
export class GetMeController {
  constructor(private getMe: GetMeUseCase) {}

  @Get()
  async handle(@CurrentUser() currentUser: UserPayload) {
    const result = await this.getMe.execute({ userId: currentUser.sub })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    const { user, permissions } = result.value
    return { user: UserPresenter.toHTTP(user, permissions) }
  }
}
```
- [ ] Create `src/infra/http/controllers/list-users.controller.ts`:
```ts
import { Controller, Get } from '@nestjs/common'
import { RequirePermissions } from '@/infra/auth/require-permissions.decorator'
import { ListUsersUseCase } from '@/domain/iam/application/use-cases/list-users'
import { AccessControlUserPresenter } from '../presenters/access-control-user-presenter'

@Controller('/users')
export class ListUsersController {
  constructor(private listUsers: ListUsersUseCase) {}

  @Get()
  @RequirePermissions('settings.permissions.manage')
  async handle() {
    const result = await this.listUsers.execute()
    const users = result.value!.users.map(({ user, permissions }) =>
      AccessControlUserPresenter.toHTTP(user, permissions),
    )
    return { users }
  }
}
```
- [ ] Create `src/infra/http/controllers/get-user-permissions.controller.ts`:
```ts
import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { GetUserPermissionsUseCase } from '@/domain/iam/application/use-cases/get-user-permissions'

@Controller('/users/:id/permissions')
export class GetUserPermissionsController {
  constructor(private getUserPermissions: GetUserPermissionsUseCase) {}

  @Get()
  async handle(@Param('id') id: string) {
    const result = await this.getUserPermissions.execute({ userId: id })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { permissions: result.value.permissions }
  }
}
```
- [ ] Create `src/infra/http/controllers/set-user-permissions.controller.ts`:
```ts
import { Body, Controller, NotFoundException, Param, Put, UsePipes } from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { RequirePermissions } from '@/infra/auth/require-permissions.decorator'
import { SetUserPermissionsUseCase } from '@/domain/iam/application/use-cases/set-user-permissions'

const bodySchema = z.object({ permissions: z.array(z.string()) })
type BodySchema = z.infer<typeof bodySchema>

@Controller('/users/:id/permissions')
export class SetUserPermissionsController {
  constructor(private setUserPermissions: SetUserPermissionsUseCase) {}

  @Put()
  @RequirePermissions('settings.permissions.manage')
  @UsePipes(new ZodValidationPipe(bodySchema))
  async handle(@Param('id') id: string, @Body() body: BodySchema) {
    const result = await this.setUserPermissions.execute({ userId: id, permissions: body.permissions })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { permissions: result.value.permissions }
  }
}
```
- [ ] Create `src/infra/http/controllers/get-permissions-catalog.controller.ts`:
```ts
import { Controller, Get } from '@nestjs/common'
import { GetPermissionsCatalogUseCase } from '@/domain/iam/application/use-cases/get-permissions-catalog'
import { PermissionPresenter } from '../presenters/permission-presenter'

@Controller('/permissions')
export class GetPermissionsCatalogController {
  constructor(private getCatalog: GetPermissionsCatalogUseCase) {}

  @Get()
  async handle() {
    const result = await this.getCatalog.execute()
    return { permissions: result.value!.permissions.map(PermissionPresenter.toHTTP) }
  }
}
```
- [ ] Update `src/infra/http/http.module.ts` — register the new controllers, use-cases, and the global `PermissionsGuard`:
```ts
import { Module } from '@nestjs/common'
import { APP_GUARD } from '@nestjs/core'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { PermissionsGuard } from '../auth/permissions.guard'
import { HealthController } from './controllers/health.controller'
import { AuthenticateController } from './controllers/authenticate.controller'
import { RefreshTokenController } from './controllers/refresh-token.controller'
import { LogoutController } from './controllers/logout.controller'
import { GetMeController } from './controllers/get-me.controller'
import { ListUsersController } from './controllers/list-users.controller'
import { GetUserPermissionsController } from './controllers/get-user-permissions.controller'
import { SetUserPermissionsController } from './controllers/set-user-permissions.controller'
import { GetPermissionsCatalogController } from './controllers/get-permissions-catalog.controller'
import { AuthenticateUseCase } from '@/domain/iam/application/use-cases/authenticate'
import { RefreshTokenUseCase } from '@/domain/iam/application/use-cases/refresh-token'
import { LogoutUseCase } from '@/domain/iam/application/use-cases/logout'
import { GetMeUseCase } from '@/domain/iam/application/use-cases/get-me'
import { ListUsersUseCase } from '@/domain/iam/application/use-cases/list-users'
import { GetUserPermissionsUseCase } from '@/domain/iam/application/use-cases/get-user-permissions'
import { SetUserPermissionsUseCase } from '@/domain/iam/application/use-cases/set-user-permissions'
import { GetPermissionsCatalogUseCase } from '@/domain/iam/application/use-cases/get-permissions-catalog'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [
    HealthController,
    AuthenticateController,
    RefreshTokenController,
    LogoutController,
    GetMeController,
    ListUsersController,
    GetUserPermissionsController,
    SetUserPermissionsController,
    GetPermissionsCatalogController,
  ],
  providers: [
    AuthenticateUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    GetMeUseCase,
    ListUsersUseCase,
    GetUserPermissionsUseCase,
    SetUserPermissionsUseCase,
    GetPermissionsCatalogUseCase,
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class HttpModule {}
```
  NOTE: `GetUserPermissionsController` and `SetUserPermissionsController` share the path `/users/:id/permissions` (GET vs PUT) — keep them as two controllers; Nest routes by method, that's fine.
- [ ] Commit `feat(backend): add /me, /users, /users/:id/permissions, /permissions endpoints`.

## Task 7: Seed permissions catalog + assign to admin

- [ ] Update `prisma/seed.ts` — after upserting the admin user, upsert the 13 permissions and assign all to admin:
```ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

const PERMISSIONS: { key: string; name: string; category: string }[] = [
  { key: 'settings.permissions.manage', name: 'Gerenciar permissões', category: 'admin' },
  { key: 'menu.dashboard', name: 'Dashboard', category: 'menu' },
  { key: 'menu.catalog', name: 'Catálogo', category: 'menu' },
  { key: 'menu.clients', name: 'Clientes', category: 'menu' },
  { key: 'menu.tickets', name: 'Chamados', category: 'menu' },
  { key: 'menu.tickets.list', name: 'Lista de Chamados', category: 'menu' },
  { key: 'menu.tickets.priorities', name: 'Prioridades', category: 'menu' },
  { key: 'menu.tickets.tags', name: 'Tags', category: 'menu' },
  { key: 'menu.budgets', name: 'Orçamentos', category: 'menu' },
  { key: 'menu.inventory', name: 'Estoque', category: 'menu' },
  { key: 'menu.sales', name: 'Vendas', category: 'menu' },
  { key: 'menu.sales.representatives', name: 'Representantes', category: 'menu' },
  { key: 'menu.sales.orders', name: 'Pedidos', category: 'menu' },
]

async function main() {
  const passwordHash = await hash('admin123', 8)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@empresa.com' },
    update: {},
    create: {
      name: 'Administrador',
      email: 'admin@empresa.com',
      passwordHash,
      isActive: true,
      jobTitle: 'Administrador da Intranet',
      department: 'Operações',
    },
  })

  for (const permission of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { key: permission.key },
      update: { name: permission.name, category: permission.category },
      create: permission,
    })
  }

  const allPermissions = await prisma.permission.findMany()
  for (const permission of allPermissions) {
    await prisma.userPermission.upsert({
      where: { userId_permissionId: { userId: admin.id, permissionId: permission.id } },
      update: {},
      create: { userId: admin.id, permissionId: permission.id },
    })
  }

  console.log(`Seeded admin (admin@empresa.com / admin123) with ${allPermissions.length} permissions`)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
```
  (The `userId_permissionId` compound unique is generated by Prisma from `@@unique([userId, permissionId])`.)
- [ ] Commit `feat(backend): seed permission catalog and assign to admin`.

## Task 8: Gate

- [ ] From `intranet-backend/`: `pnpm prisma generate` → success (Permission/UserPermission present).
- [ ] `pnpm test` → all unit specs pass (get-me 2 + get-user-permissions 2 + catalog 1 + list-users 1 + set-user-permissions 2 + existing 18 = green).
- [ ] `pnpm build` → success; `dist/infra/main.js` exists.
- [ ] `git status` clean; nothing gitignored staged.
- [ ] **[needs Docker]** runtime: `pnpm prisma migrate dev --name permissions`, `pnpm prisma db seed`, then `GET /me` (bearer) → `{ user: { …, permissions:[13] } }`; `GET /users` (admin) → `{ users:[…] }`; `PUT /users/:id/permissions` → `{ permissions }`; `GET /permissions` → catalog.

---

## Done Criteria
- `Permission` entity/schema/repo; `PermissionsGuard` + `@RequirePermissions`.
- Use-cases: get-me, get-user-permissions, get-permissions-catalog, list-users, set-user-permissions — all with passing unit tests.
- Endpoints: `GET /me`, `GET /users`, `GET /users/:id/permissions`, `PUT /users/:id/permissions`, `GET /permissions` wired; admin-only routes gated by `@RequirePermissions('settings.permissions.manage')`.
- Seed: 13-permission catalog assigned to admin.
- `pnpm test` + `pnpm build` + `pnpm prisma generate` pass.

## Next (F3b / F4)
- **F3b:** `UserPreferences` entity/schema/repo; `GET /me/preferences`, `PATCH /me/preferences`.
- **F4:** clients module (CRUD + filters + lookups) — first business domain.
