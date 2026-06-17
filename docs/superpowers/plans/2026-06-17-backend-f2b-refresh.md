# Backend F2b — Refresh Token + Logout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Complete the session contract — persisted **refresh tokens** with rotation and **logout**. `AuthenticateUseCase` now also issues+persists a refresh token; add `RefreshTokenUseCase` (rotate) and `LogoutUseCase` (revoke), the `RefreshToken` entity/schema/repo, and the `POST /sessions/refresh` + `POST /sessions/logout` endpoints. Final auth contract: `{ accessToken, refreshToken }`.

**Architecture:** DDD per spec `docs/superpowers/specs/2026-06-16-intranet-backend-design.md`, bounded context `iam`. Refresh tokens are opaque random strings (`randomUUID`) persisted in `refresh_tokens` with `expiresAt`/`revokedAt`. TTL = 7 days (constant). Refresh rotation = revoke old + issue new pair.

**Tech Stack:** NestJS 10, Prisma, Vitest. pnpm. Builds on F2.

**Working dir:** repo root; backend `intranet-backend/`. Branch `feat/backend-f2b-refresh`. $TEMPLATE = `/Users/guilherme/www/studies/05-nest-clean`.

**Env constraints:** No Docker/Postgres here. Gates here: `pnpm test` (unit), `pnpm prisma generate` (validates the new `RefreshToken` model), `pnpm build`. Migration/e2e/boot are **[needs Docker]**.

---

## Task 1: RefreshToken entity + repository + in-memory repo

- [ ] Create `src/domain/iam/enterprise/entities/refresh-token.ts`:
```ts
import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface RefreshTokenProps {
  userId: UniqueEntityID
  token: string
  expiresAt: Date
  revokedAt?: Date | null
  createdAt: Date
}

export class RefreshToken extends Entity<RefreshTokenProps> {
  get userId() { return this.props.userId }
  get token() { return this.props.token }
  get expiresAt() { return this.props.expiresAt }
  get revokedAt() { return this.props.revokedAt }
  get createdAt() { return this.props.createdAt }

  get isExpired() { return this.props.expiresAt.getTime() < Date.now() }
  get isRevoked() { return this.props.revokedAt !== null && this.props.revokedAt !== undefined }
  get isValid() { return !this.isExpired && !this.isRevoked }

  revoke() { this.props.revokedAt = new Date() }

  static create(props: Optional<RefreshTokenProps, 'createdAt'>, id?: UniqueEntityID) {
    return new RefreshToken({ ...props, createdAt: props.createdAt ?? new Date() }, id)
  }
}
```
- [ ] Create `src/domain/iam/application/repositories/refresh-tokens-repository.ts`:
```ts
import { RefreshToken } from '../../enterprise/entities/refresh-token'

export abstract class RefreshTokensRepository {
  abstract create(refreshToken: RefreshToken): Promise<void>
  abstract findByToken(token: string): Promise<RefreshToken | null>
  abstract save(refreshToken: RefreshToken): Promise<void>
}
```
- [ ] Create `test/repositories/in-memory-refresh-tokens-repository.ts`:
```ts
import { RefreshTokensRepository } from '@/domain/iam/application/repositories/refresh-tokens-repository'
import { RefreshToken } from '@/domain/iam/enterprise/entities/refresh-token'

export class InMemoryRefreshTokensRepository implements RefreshTokensRepository {
  public items: RefreshToken[] = []

  async create(refreshToken: RefreshToken) {
    this.items.push(refreshToken)
  }

  async findByToken(token: string) {
    return this.items.find((item) => item.token === token) ?? null
  }

  async save(refreshToken: RefreshToken) {
    const index = this.items.findIndex((item) => item.id.equals(refreshToken.id))
    if (index >= 0) this.items[index] = refreshToken
  }
}
```
- [ ] Create a shared TTL constant `src/domain/iam/application/use-cases/refresh-token-ttl.ts`:
```ts
// Refresh token lifetime in milliseconds (7 days).
export const REFRESH_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7
```
- [ ] Commit `feat(backend): add RefreshToken entity, repository and in-memory repo`.

## Task 2: AuthenticateUseCase now issues + persists a refresh token (update + TDD)

- [ ] Update `src/domain/iam/application/use-cases/authenticate.ts`:
```ts
import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { UsersRepository } from '../repositories/users-repository'
import { RefreshTokensRepository } from '../repositories/refresh-tokens-repository'
import { HashComparer } from '../cryptography/hash-comparer'
import { Encrypter } from '../cryptography/encrypter'
import { WrongCredentialsError } from './errors/wrong-credentials-error'
import { RefreshToken } from '../../enterprise/entities/refresh-token'
import { REFRESH_TOKEN_TTL_MS } from './refresh-token-ttl'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

type AuthenticateUseCaseResponse = Either<
  WrongCredentialsError,
  { accessToken: string; refreshToken: string }
>

@Injectable()
export class AuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
    private refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async execute({ email, password }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)
    if (!user) return left(new WrongCredentialsError())

    const isPasswordValid = await this.hashComparer.compare(password, user.passwordHash)
    if (!isPasswordValid) return left(new WrongCredentialsError())

    const accessToken = await this.encrypter.encrypt({ sub: user.id.toString() })

    const refreshTokenValue = randomUUID()
    const refreshToken = RefreshToken.create({
      userId: user.id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    })
    await this.refreshTokensRepository.create(refreshToken)

    return right({ accessToken, refreshToken: refreshTokenValue })
  }
}
```
- [ ] Update `src/domain/iam/application/use-cases/authenticate.spec.ts`: add the in-memory refresh-tokens repo to the SUT and assert the new shape. Replace the file with:
```ts
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { InMemoryRefreshTokensRepository } from 'test/repositories/in-memory-refresh-tokens-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { makeUser } from 'test/factories/make-user'
import { AuthenticateUseCase } from './authenticate'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let inMemoryRefreshTokensRepository: InMemoryRefreshTokensRepository
let fakeHasher: FakeHasher
let encrypter: FakeEncrypter
let sut: AuthenticateUseCase

describe('Authenticate', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    inMemoryRefreshTokensRepository = new InMemoryRefreshTokensRepository()
    fakeHasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new AuthenticateUseCase(
      inMemoryUsersRepository,
      fakeHasher,
      encrypter,
      inMemoryRefreshTokensRepository,
    )
  })

  it('should authenticate and issue access + refresh tokens', async () => {
    const user = makeUser({
      email: 'admin@empresa.com',
      passwordHash: await fakeHasher.hash('admin123'),
    })
    inMemoryUsersRepository.items.push(user)

    const result = await sut.execute({ email: 'admin@empresa.com', password: 'admin123' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
    }
    expect(inMemoryRefreshTokensRepository.items).toHaveLength(1)
  })

  it('should not authenticate with a wrong password', async () => {
    const user = makeUser({
      email: 'admin@empresa.com',
      passwordHash: await fakeHasher.hash('admin123'),
    })
    inMemoryUsersRepository.items.push(user)

    const result = await sut.execute({ email: 'admin@empresa.com', password: 'wrong' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('should not authenticate a non-existent user', async () => {
    const result = await sut.execute({ email: 'nobody@empresa.com', password: 'x' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })
})
```
- [ ] Run `pnpm test src/domain/iam/application/use-cases/authenticate.spec.ts` → 3 passing.
- [ ] Commit `feat(backend): authenticate now issues and persists a refresh token`.

## Task 3: RefreshTokenUseCase (TDD)

- [ ] Create `src/domain/iam/application/use-cases/errors/invalid-refresh-token-error.ts`:
```ts
import { UseCaseError } from '@/core/errors/use-case-error'

export class InvalidRefreshTokenError extends Error implements UseCaseError {
  constructor() {
    super('Refresh token is invalid, expired or revoked.')
  }
}
```
- [ ] Write the failing spec `src/domain/iam/application/use-cases/refresh-token.spec.ts`:
```ts
import { InMemoryRefreshTokensRepository } from 'test/repositories/in-memory-refresh-tokens-repository'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { RefreshToken } from '@/domain/iam/enterprise/entities/refresh-token'
import { RefreshTokenUseCase } from './refresh-token'
import { InvalidRefreshTokenError } from './errors/invalid-refresh-token-error'

let inMemoryRefreshTokensRepository: InMemoryRefreshTokensRepository
let encrypter: FakeEncrypter
let sut: RefreshTokenUseCase

function makeRefreshToken(token: string, overrides: Partial<{ expiresAt: Date; revokedAt: Date | null }> = {}) {
  return RefreshToken.create({
    userId: new UniqueEntityID('user-1'),
    token,
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60),
    revokedAt: overrides.revokedAt ?? null,
  })
}

describe('Refresh Token', () => {
  beforeEach(() => {
    inMemoryRefreshTokensRepository = new InMemoryRefreshTokensRepository()
    encrypter = new FakeEncrypter()
    sut = new RefreshTokenUseCase(inMemoryRefreshTokensRepository, encrypter)
  })

  it('rotates a valid refresh token into a new token pair', async () => {
    inMemoryRefreshTokensRepository.items.push(makeRefreshToken('valid-token'))

    const result = await sut.execute({ refreshToken: 'valid-token' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
      expect(result.value.refreshToken).not.toBe('valid-token')
    }
    // old token revoked, new token persisted
    const old = await inMemoryRefreshTokensRepository.findByToken('valid-token')
    expect(old?.isRevoked).toBe(true)
    expect(inMemoryRefreshTokensRepository.items).toHaveLength(2)
  })

  it('rejects an unknown refresh token', async () => {
    const result = await sut.execute({ refreshToken: 'nope' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })

  it('rejects a revoked refresh token', async () => {
    inMemoryRefreshTokensRepository.items.push(makeRefreshToken('revoked', { revokedAt: new Date() }))
    const result = await sut.execute({ refreshToken: 'revoked' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })

  it('rejects an expired refresh token', async () => {
    inMemoryRefreshTokensRepository.items.push(makeRefreshToken('expired', { expiresAt: new Date(Date.now() - 1000) }))
    const result = await sut.execute({ refreshToken: 'expired' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })
})
```
- [ ] Run → FAIL. Implement `src/domain/iam/application/use-cases/refresh-token.ts`:
```ts
import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { RefreshTokensRepository } from '../repositories/refresh-tokens-repository'
import { Encrypter } from '../cryptography/encrypter'
import { RefreshToken } from '../../enterprise/entities/refresh-token'
import { InvalidRefreshTokenError } from './errors/invalid-refresh-token-error'
import { REFRESH_TOKEN_TTL_MS } from './refresh-token-ttl'

interface RefreshTokenUseCaseRequest {
  refreshToken: string
}

type RefreshTokenUseCaseResponse = Either<
  InvalidRefreshTokenError,
  { accessToken: string; refreshToken: string }
>

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private refreshTokensRepository: RefreshTokensRepository,
    private encrypter: Encrypter,
  ) {}

  async execute({ refreshToken }: RefreshTokenUseCaseRequest): Promise<RefreshTokenUseCaseResponse> {
    const stored = await this.refreshTokensRepository.findByToken(refreshToken)
    if (!stored || !stored.isValid) return left(new InvalidRefreshTokenError())

    stored.revoke()
    await this.refreshTokensRepository.save(stored)

    const newTokenValue = randomUUID()
    const rotated = RefreshToken.create({
      userId: stored.userId,
      token: newTokenValue,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    })
    await this.refreshTokensRepository.create(rotated)

    const accessToken = await this.encrypter.encrypt({ sub: stored.userId.toString() })

    return right({ accessToken, refreshToken: newTokenValue })
  }
}
```
- [ ] Run → PASS (4). Commit `feat(backend): add RefreshTokenUseCase with rotation (TDD)`.

## Task 4: LogoutUseCase (TDD)

- [ ] Write failing spec `src/domain/iam/application/use-cases/logout.spec.ts`:
```ts
import { InMemoryRefreshTokensRepository } from 'test/repositories/in-memory-refresh-tokens-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { RefreshToken } from '@/domain/iam/enterprise/entities/refresh-token'
import { LogoutUseCase } from './logout'

let inMemoryRefreshTokensRepository: InMemoryRefreshTokensRepository
let sut: LogoutUseCase

describe('Logout', () => {
  beforeEach(() => {
    inMemoryRefreshTokensRepository = new InMemoryRefreshTokensRepository()
    sut = new LogoutUseCase(inMemoryRefreshTokensRepository)
  })

  it('revokes the given refresh token', async () => {
    inMemoryRefreshTokensRepository.items.push(
      RefreshToken.create({
        userId: new UniqueEntityID('user-1'),
        token: 'tok',
        expiresAt: new Date(Date.now() + 1000 * 60),
      }),
    )

    const result = await sut.execute({ refreshToken: 'tok' })

    expect(result.isRight()).toBe(true)
    const stored = await inMemoryRefreshTokensRepository.findByToken('tok')
    expect(stored?.isRevoked).toBe(true)
  })

  it('is idempotent for an unknown token', async () => {
    const result = await sut.execute({ refreshToken: 'missing' })
    expect(result.isRight()).toBe(true)
  })
})
```
- [ ] Run → FAIL. Implement `src/domain/iam/application/use-cases/logout.ts`:
```ts
import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { RefreshTokensRepository } from '../repositories/refresh-tokens-repository'

interface LogoutUseCaseRequest {
  refreshToken: string
}

type LogoutUseCaseResponse = Either<never, null>

@Injectable()
export class LogoutUseCase {
  constructor(private refreshTokensRepository: RefreshTokensRepository) {}

  async execute({ refreshToken }: LogoutUseCaseRequest): Promise<LogoutUseCaseResponse> {
    const stored = await this.refreshTokensRepository.findByToken(refreshToken)
    if (stored && !stored.isRevoked) {
      stored.revoke()
      await this.refreshTokensRepository.save(stored)
    }
    return right(null)
  }
}
```
- [ ] Run → PASS (2). Commit `feat(backend): add LogoutUseCase (TDD)`.

## Task 5: Prisma — schema, mapper, repository, wiring

- [ ] Update `prisma/schema.prisma`: add the `RefreshToken` model and the back-relation on `User`:
```prisma
model User {
  // ... existing fields unchanged ...
  refreshTokens RefreshToken[]

  @@map("users")
}

model RefreshToken {
  id        String    @id @default(uuid())
  token     String    @unique
  userId    String    @map("user_id")
  expiresAt DateTime  @map("expires_at")
  revokedAt DateTime? @map("revoked_at")
  createdAt DateTime  @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id])

  @@map("refresh_tokens")
}
```
  (Add the `refreshTokens RefreshToken[]` line inside the existing `User` model, before its `@@map`.)
- [ ] `pnpm prisma generate` → regenerates client with `RefreshToken`.
- [ ] Create `src/infra/database/prisma/mappers/prisma-refresh-token-mapper.ts`:
```ts
import { RefreshToken as PrismaRefreshToken, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { RefreshToken } from '@/domain/iam/enterprise/entities/refresh-token'

export class PrismaRefreshTokenMapper {
  static toDomain(raw: PrismaRefreshToken): RefreshToken {
    return RefreshToken.create(
      {
        userId: new UniqueEntityID(raw.userId),
        token: raw.token,
        expiresAt: raw.expiresAt,
        revokedAt: raw.revokedAt,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(refreshToken: RefreshToken): Prisma.RefreshTokenUncheckedCreateInput {
    return {
      id: refreshToken.id.toString(),
      token: refreshToken.token,
      userId: refreshToken.userId.toString(),
      expiresAt: refreshToken.expiresAt,
      revokedAt: refreshToken.revokedAt ?? null,
      createdAt: refreshToken.createdAt,
    }
  }
}
```
- [ ] Create `src/infra/database/prisma/repositories/prisma-refresh-tokens-repository.ts`:
```ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { RefreshTokensRepository } from '@/domain/iam/application/repositories/refresh-tokens-repository'
import { RefreshToken } from '@/domain/iam/enterprise/entities/refresh-token'
import { PrismaRefreshTokenMapper } from '../mappers/prisma-refresh-token-mapper'

@Injectable()
export class PrismaRefreshTokensRepository implements RefreshTokensRepository {
  constructor(private prisma: PrismaService) {}

  async create(refreshToken: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.create({ data: PrismaRefreshTokenMapper.toPrisma(refreshToken) })
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const found = await this.prisma.refreshToken.findUnique({ where: { token } })
    return found ? PrismaRefreshTokenMapper.toDomain(found) : null
  }

  async save(refreshToken: RefreshToken): Promise<void> {
    const data = PrismaRefreshTokenMapper.toPrisma(refreshToken)
    await this.prisma.refreshToken.update({ where: { id: data.id as string }, data })
  }
}
```
- [ ] Update `src/infra/database/database.module.ts` to also provide/export `RefreshTokensRepository`:
```ts
import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { UsersRepository } from '@/domain/iam/application/repositories/users-repository'
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository'
import { RefreshTokensRepository } from '@/domain/iam/application/repositories/refresh-tokens-repository'
import { PrismaRefreshTokensRepository } from './prisma/repositories/prisma-refresh-tokens-repository'

@Module({
  providers: [
    PrismaService,
    { provide: UsersRepository, useClass: PrismaUsersRepository },
    { provide: RefreshTokensRepository, useClass: PrismaRefreshTokensRepository },
  ],
  exports: [PrismaService, UsersRepository, RefreshTokensRepository],
})
export class DatabaseModule {}
```
- [ ] Commit `feat(backend): add RefreshToken schema, mapper, repository and wiring`.

## Task 6: Controllers (authenticate update + refresh + logout) + wiring

- [ ] Update `src/infra/http/controllers/authenticate.controller.ts` `handle` return to include the refresh token:
  - the result is now `{ accessToken, refreshToken }`; change the final lines to:
    ```ts
    const { accessToken, refreshToken } = result.value
    return { accessToken, refreshToken }
    ```
- [ ] Create `src/infra/http/controllers/refresh-token.controller.ts`:
```ts
import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { RefreshTokenUseCase } from '@/domain/iam/application/use-cases/refresh-token'
import { InvalidRefreshTokenError } from '@/domain/iam/application/use-cases/errors/invalid-refresh-token-error'
import { Public } from '@/infra/auth/public'

const refreshBodySchema = z.object({ refreshToken: z.string() })
type RefreshBodySchema = z.infer<typeof refreshBodySchema>

@Controller('/sessions/refresh')
@Public()
export class RefreshTokenController {
  constructor(private refreshToken: RefreshTokenUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(refreshBodySchema))
  async handle(@Body() body: RefreshBodySchema) {
    const result = await this.refreshToken.execute({ refreshToken: body.refreshToken })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case InvalidRefreshTokenError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { accessToken, refreshToken } = result.value
    return { accessToken, refreshToken }
  }
}
```
- [ ] Create `src/infra/http/controllers/logout.controller.ts` (authenticated route — global guard applies, no `@Public`):
```ts
import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { LogoutUseCase } from '@/domain/iam/application/use-cases/logout'

const logoutBodySchema = z.object({ refreshToken: z.string() })
type LogoutBodySchema = z.infer<typeof logoutBodySchema>

@Controller('/sessions/logout')
export class LogoutController {
  constructor(private logout: LogoutUseCase) {}

  @Post()
  @HttpCode(204)
  @UsePipes(new ZodValidationPipe(logoutBodySchema))
  async handle(@Body() body: LogoutBodySchema) {
    await this.logout.execute({ refreshToken: body.refreshToken })
  }
}
```
- [ ] Update `src/infra/http/http.module.ts` to register the new controllers + use-cases:
```ts
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { HealthController } from './controllers/health.controller'
import { AuthenticateController } from './controllers/authenticate.controller'
import { RefreshTokenController } from './controllers/refresh-token.controller'
import { LogoutController } from './controllers/logout.controller'
import { AuthenticateUseCase } from '@/domain/iam/application/use-cases/authenticate'
import { RefreshTokenUseCase } from '@/domain/iam/application/use-cases/refresh-token'
import { LogoutUseCase } from '@/domain/iam/application/use-cases/logout'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [HealthController, AuthenticateController, RefreshTokenController, LogoutController],
  providers: [AuthenticateUseCase, RefreshTokenUseCase, LogoutUseCase],
})
export class HttpModule {}
```
- [ ] Commit `feat(backend): add /sessions/refresh and /sessions/logout endpoints`.

## Task 7: Gate

- [ ] From `intranet-backend/`: `pnpm prisma generate` → success (RefreshToken model present).
- [ ] `pnpm test` → all unit specs pass (authenticate 3 + refresh-token 4 + logout 2 + existing = green).
- [ ] `pnpm build` → success; `dist/infra/main.js` exists.
- [ ] `git status` clean; nothing gitignored staged.
- [ ] **[needs Docker]** runtime: `pnpm prisma migrate dev --name refresh_tokens`, then exercise `POST /sessions` → `{accessToken, refreshToken}`, `POST /sessions/refresh` → new pair, `POST /sessions/logout` (with bearer) → 204.

---

## Done Criteria
- `RefreshToken` entity/schema/repo; `AuthenticateUseCase` returns `{accessToken, refreshToken}` and persists the refresh token.
- `RefreshTokenUseCase` (rotation, 4 tests), `LogoutUseCase` (2 tests) green; `POST /sessions/refresh` (`@Public`) + `POST /sessions/logout` (authed) wired.
- `pnpm test` + `pnpm build` + `pnpm prisma generate` pass.

## Next (F3)
- Permissions + user-permissions + preferences; `GET /me` returning `permissions[]`; `PermissionsGuard` + `@RequirePermissions`; seed base permissions + assign to admin.
