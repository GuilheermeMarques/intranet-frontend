# Backend F2 — iam/auth (Authenticate) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** First real vertical slice of the backend — the `User` entity, the `AuthenticateUseCase` (TDD), the Prisma user repository, the `POST /api/v1/sessions` endpoint, and an admin seed — so the system can issue a JWT access token. Mirrors the template `/Users/guilherme/www/studies/05-nest-clean` ($TEMPLATE).

**Architecture:** Clean Architecture / DDD per spec `docs/superpowers/specs/2026-06-16-intranet-backend-design.md`. Use-cases return `Either`; unit specs run against in-memory repos + fake crypto; the controller maps `Left` to HTTP. Bounded context `iam`.

**Scope boundaries:** F2 = authenticate (access token) + admin seed + the reusable test infrastructure. **Deferred:** refresh-token rotation + logout (F2b), `GET /me` with `permissions[]` (F3, needs the permissions module).

**Tech Stack:** NestJS 10, Prisma, Passport-JWT (RS256), bcryptjs, Vitest + Supertest. pnpm.

**Working dir:** repo root; backend `intranet-backend/`. Branch `feat/backend-f2-auth`. $TEMPLATE = `/Users/guilherme/www/studies/05-nest-clean`.

**Env constraints:** No Docker/Postgres here. Gates achievable here: `pnpm test` (unit specs — in-memory, no DB), `pnpm build`. The e2e spec + seed + migrations need Docker and are **[needs Docker]** (documented, run on user machine). The Prisma `User` model already exists (from F0) with all needed fields — no schema change in F2.

---

## Task 1: Dev dependencies + test doubles

- [ ] From `intranet-backend/`, add dev deps: `pnpm add -D @faker-js/faker@^8.0.2 dotenv@^16.3.1 supertest@^6.3.3 @types/supertest@^2.0.12`
- [ ] Create `test/cryptography/fake-hasher.ts`:
```ts
import { HashComparer } from '@/domain/iam/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/iam/application/cryptography/hash-generator'

export class FakeHasher implements HashGenerator, HashComparer {
  async hash(plain: string): Promise<string> {
    return plain.concat('-hashed')
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return plain.concat('-hashed') === hash
  }
}
```
- [ ] Create `test/cryptography/fake-encrypter.ts`:
```ts
import { Encrypter } from '@/domain/iam/application/cryptography/encrypter'

export class FakeEncrypter implements Encrypter {
  async encrypt(payload: Record<string, unknown>): Promise<string> {
    return JSON.stringify(payload)
  }
}
```
- [ ] Commit `test(backend): add fake hasher/encrypter doubles`.

## Task 2: User entity + repository interface

- [ ] Create `src/domain/iam/enterprise/entities/user.ts`:
```ts
import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface UserProps {
  name: string
  email: string
  passwordHash: string
  isActive: boolean
  avatar?: string | null
  jobTitle?: string | null
  department?: string | null
  lastLoginAt?: Date | null
}

export class User extends Entity<UserProps> {
  get name() { return this.props.name }
  get email() { return this.props.email }
  get passwordHash() { return this.props.passwordHash }
  get isActive() { return this.props.isActive }
  get avatar() { return this.props.avatar }
  get jobTitle() { return this.props.jobTitle }
  get department() { return this.props.department }
  get lastLoginAt() { return this.props.lastLoginAt }

  static create(props: Optional<UserProps, 'isActive'>, id?: UniqueEntityID) {
    const user = new User({ ...props, isActive: props.isActive ?? true }, id)
    return user
  }
}
```
- [ ] Create `src/domain/iam/application/repositories/users-repository.ts`:
```ts
import { User } from '../../enterprise/entities/user'

export abstract class UsersRepository {
  abstract findByEmail(email: string): Promise<User | null>
  abstract findById(id: string): Promise<User | null>
  abstract create(user: User): Promise<void>
}
```
- [ ] Commit `feat(backend): add User entity and UsersRepository interface`.

## Task 3: In-memory repo + user factory

- [ ] Create `test/repositories/in-memory-users-repository.ts`:
```ts
import { UsersRepository } from '@/domain/iam/application/repositories/users-repository'
import { User } from '@/domain/iam/enterprise/entities/user'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async findByEmail(email: string) {
    return this.items.find((item) => item.email === email) ?? null
  }

  async findById(id: string) {
    return this.items.find((item) => item.id.toString() === id) ?? null
  }

  async create(user: User) {
    this.items.push(user)
  }
}
```
- [ ] Create `test/factories/make-user.ts`:
```ts
import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, UserProps } from '@/domain/iam/enterprise/entities/user'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaUserMapper } from '@/infra/database/prisma/mappers/prisma-user-mapper'

export function makeUser(override: Partial<UserProps> = {}, id?: UniqueEntityID) {
  return User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash: faker.internet.password(),
      isActive: true,
      ...override,
    },
    id,
  )
}

@Injectable()
export class UserFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaUser(data: Partial<UserProps> = {}): Promise<User> {
    const user = makeUser(data)
    await this.prisma.user.create({ data: PrismaUserMapper.toPrisma(user) })
    return user
  }
}
```
  (This imports `PrismaUserMapper`, created in Task 5 — fine, the factory is only compiled, used by e2e.)
- [ ] Commit `test(backend): add in-memory users repository and user factory`.

## Task 4: AuthenticateUseCase (TDD)

- [ ] Create `src/domain/iam/application/use-cases/errors/wrong-credentials-error.ts`:
```ts
import { UseCaseError } from '@/core/errors/use-case-error'

export class WrongCredentialsError extends Error implements UseCaseError {
  constructor() {
    super('Credentials are not valid.')
  }
}
```
- [ ] Write the failing spec `src/domain/iam/application/use-cases/authenticate.spec.ts`:
```ts
import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { makeUser } from 'test/factories/make-user'
import { AuthenticateUseCase } from './authenticate'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let fakeHasher: FakeHasher
let encrypter: FakeEncrypter
let sut: AuthenticateUseCase

describe('Authenticate', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeHasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new AuthenticateUseCase(inMemoryUsersRepository, fakeHasher, encrypter)
  })

  it('should authenticate a user with valid credentials', async () => {
    const user = makeUser({
      email: 'admin@empresa.com',
      passwordHash: await fakeHasher.hash('admin123'),
    })
    inMemoryUsersRepository.items.push(user)

    const result = await sut.execute({ email: 'admin@empresa.com', password: 'admin123' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value).toEqual({ accessToken: expect.any(String) })
    }
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
- [ ] Run `pnpm test src/domain/iam/application/use-cases/authenticate.spec.ts` → FAIL (module not found).
- [ ] Implement `src/domain/iam/application/use-cases/authenticate.ts`:
```ts
import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/users-repository'
import { HashComparer } from '../cryptography/hash-comparer'
import { Encrypter } from '../cryptography/encrypter'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

type AuthenticateUseCaseResponse = Either<WrongCredentialsError, { accessToken: string }>

@Injectable()
export class AuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
  ) {}

  async execute({ email, password }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)
    if (!user) return left(new WrongCredentialsError())

    const isPasswordValid = await this.hashComparer.compare(password, user.passwordHash)
    if (!isPasswordValid) return left(new WrongCredentialsError())

    const accessToken = await this.encrypter.encrypt({ sub: user.id.toString() })
    return right({ accessToken })
  }
}
```
- [ ] Run `pnpm test src/domain/iam/application/use-cases/authenticate.spec.ts` → PASS (3 tests).
- [ ] Commit `feat(backend): add AuthenticateUseCase (TDD)`.

## Task 5: Prisma mapper + repository, wire DatabaseModule

- [ ] Create `src/infra/database/prisma/mappers/prisma-user-mapper.ts`:
```ts
import { User as PrismaUser, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User } from '@/domain/iam/enterprise/entities/user'

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        passwordHash: raw.passwordHash,
        isActive: raw.isActive,
        avatar: raw.avatar,
        jobTitle: raw.jobTitle,
        department: raw.department,
        lastLoginAt: raw.lastLoginAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      isActive: user.isActive,
      avatar: user.avatar ?? null,
      jobTitle: user.jobTitle ?? null,
      department: user.department ?? null,
      lastLoginAt: user.lastLoginAt ?? null,
    }
  }
}
```
- [ ] Create `src/infra/database/prisma/repositories/prisma-users-repository.ts`:
```ts
import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { UsersRepository } from '@/domain/iam/application/repositories/users-repository'
import { User } from '@/domain/iam/enterprise/entities/user'
import { PrismaUserMapper } from '../mappers/prisma-user-mapper'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    return user ? PrismaUserMapper.toDomain(user) : null
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    return user ? PrismaUserMapper.toDomain(user) : null
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({ data: PrismaUserMapper.toPrisma(user) })
  }
}
```
- [ ] Update `src/infra/database/database.module.ts` to provide+export `UsersRepository`:
```ts
import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'
import { UsersRepository } from '@/domain/iam/application/repositories/users-repository'
import { PrismaUsersRepository } from './prisma/repositories/prisma-users-repository'

@Module({
  providers: [
    PrismaService,
    { provide: UsersRepository, useClass: PrismaUsersRepository },
  ],
  exports: [PrismaService, UsersRepository],
})
export class DatabaseModule {}
```
- [ ] Commit `feat(backend): add Prisma user mapper, repository and wire DatabaseModule`.

## Task 6: Authenticate controller + wire HttpModule

- [ ] Create `src/infra/http/controllers/authenticate.controller.ts`:
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
import { AuthenticateUseCase } from '@/domain/iam/application/use-cases/authenticate'
import { WrongCredentialsError } from '@/domain/iam/application/use-cases/errors/wrong-credentials-error'
import { Public } from '@/infra/auth/public'

const authenticateBodySchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

type AuthenticateBodySchema = z.infer<typeof authenticateBodySchema>

@Controller('/sessions')
@Public()
export class AuthenticateController {
  constructor(private authenticate: AuthenticateUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(authenticateBodySchema))
  async handle(@Body() body: AuthenticateBodySchema) {
    const { email, password } = body

    const result = await this.authenticate.execute({ email, password })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case WrongCredentialsError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { accessToken } = result.value
    return { accessToken }
  }
}
```
- [ ] Update `src/infra/http/http.module.ts`:
```ts
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { CryptographyModule } from '../cryptography/cryptography.module'
import { HealthController } from './controllers/health.controller'
import { AuthenticateController } from './controllers/authenticate.controller'
import { AuthenticateUseCase } from '@/domain/iam/application/use-cases/authenticate'

@Module({
  imports: [DatabaseModule, CryptographyModule],
  controllers: [HealthController, AuthenticateController],
  providers: [AuthenticateUseCase],
})
export class HttpModule {}
```
- [ ] Create the e2e spec `src/infra/http/controllers/authenticate.controller.e2e-spec.ts` (**[needs Docker]** — won't run here, runs on user machine):
```ts
import { AppModule } from '@/infra/app.module'
import { DatabaseModule } from '@/infra/database/database.module'
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { hash } from 'bcryptjs'
import request from 'supertest'
import { UserFactory } from 'test/factories/make-user'

describe('Authenticate (E2E)', () => {
  let app: INestApplication
  let userFactory: UserFactory

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [UserFactory],
    }).compile()

    app = moduleRef.createNestApplication()
    app.setGlobalPrefix('api/v1')
    userFactory = moduleRef.get(UserFactory)
    await app.init()
  })

  test('[POST] /sessions', async () => {
    await userFactory.makePrismaUser({
      email: 'admin@empresa.com',
      passwordHash: await hash('admin123', 8),
    })

    const response = await request(app.getHttpServer())
      .post('/api/v1/sessions')
      .send({ email: 'admin@empresa.com', password: 'admin123' })

    expect(response.statusCode).toBe(201)
    expect(response.body).toEqual({ accessToken: expect.any(String) })
  })
})
```
- [ ] Commit `feat(backend): add POST /sessions authenticate endpoint (+ e2e spec)`.

## Task 7: Admin seed

- [ ] Create `prisma/seed.ts`:
```ts
import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await hash('admin123', 8)

  await prisma.user.upsert({
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

  console.log('Seeded admin user: admin@empresa.com / admin123')
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
```
  (`package.json` already has the `"prisma": { "seed": "ts-node prisma/seed.ts" }` config from F0.)
- [ ] Commit `feat(backend): add admin user seed`.

## Task 8: Gate

- [ ] From `intranet-backend/`: `pnpm install` (lockfile updated for new dev deps).
- [ ] `pnpm prisma generate` → success.
- [ ] `pnpm test` → the unit spec `authenticate.spec.ts` passes (3 tests). (e2e specs are matched only by the separate e2e config and are NOT run here.)
- [ ] `pnpm build` → success; `dist/infra/main.js` exists.
- [ ] Confirm `git status` clean; `.env`/`node_modules`/`dist` not staged.
- [ ] Commit lockfile `chore(backend): update lockfile for F2 dev deps`.
- [ ] **[needs Docker]** runtime check to document (user machine): `docker compose up -d postgres` → `pnpm prisma migrate dev` → `pnpm prisma db seed` → `pnpm start:dev` → `curl -X POST localhost:3001/api/v1/sessions -H 'Content-Type: application/json' -d '{"email":"admin@empresa.com","password":"admin123"}'` → `{"accessToken":"..."}`. Also `pnpm test:e2e` runs the e2e spec.

---

## Done Criteria
- `User` entity + `UsersRepository` + `AuthenticateUseCase` (3 passing unit tests) + Prisma mapper/repo wired.
- `POST /api/v1/sessions` (`@Public`) returns `{ accessToken }`; e2e spec written.
- Admin seed (`admin@empresa.com` / `admin123`).
- Gates here: `pnpm test` (unit) + `pnpm build` pass; nothing secret committed.

## Next (F2b / F3)
- **F2b:** RefreshToken entity + repository + schema, `POST /sessions/refresh` (rotation), `POST /sessions/logout`.
- **F3:** Permissions + preferences; `GET /me` returning `permissions[]`; `PermissionsGuard` + `@RequirePermissions`.
