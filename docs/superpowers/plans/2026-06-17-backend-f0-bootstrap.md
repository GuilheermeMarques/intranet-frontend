# Backend F0 — Bootstrap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Scaffold the NestJS backend in `intranet-backend/` faithfully mirroring the template `/Users/guilherme/www/studies/05-nest-clean`, so it compiles, Prisma generates, and (on a machine with Docker) boots with a working `GET /api/v1/health`.

**Architecture:** Clean Architecture per the spec `docs/superpowers/specs/2026-06-16-intranet-backend-design.md`. F0 lays the foundation: project config, `core/` copied verbatim, env module (Zod-validated), Prisma service + minimal schema, a health endpoint, and the app bootstrap. Domain modules (auth, iam, sales, support) come in later phases.

**Tech Stack:** Node 22+, NestJS 10, TypeScript, Prisma + PostgreSQL, Zod, Vitest. Package manager: **pnpm** (matches template).

**Working dir:** repo root `/Users/guilherme/www/projects/intranet`; backend at `intranet-backend/`. Branch: `feat/backend-bootstrap`.

**Template to copy from:** `/Users/guilherme/www/studies/05-nest-clean` (referred to below as `$TEMPLATE`).

**Environment constraints (important):** This sandbox has **no running Docker/Postgres**. So F0 can be verified here only up to: `pnpm install`, `pnpm prisma generate`, and `pnpm build` (nest build / tsc). The actual **boot + DB-connected health check must be run on a machine with Docker** (`docker compose up` → `pnpm prisma migrate dev` → `pnpm start:dev` → `curl localhost:3001/api/v1/health`). The plan's runtime steps are written for that machine and marked **[needs Docker]**.

---

## File Structure (created in `intranet-backend/`)
```
package.json, tsconfig.json, tsconfig.build.json, nest-cli.json,
vitest.config.ts, vitest.config.e2e.ts, .eslintrc.json, .gitignore,
.env.example, .env (gitignored, dummy values for local build), docker-compose.yml
prisma/schema.prisma
src/
  core/**                         # copied verbatim from $TEMPLATE/src/core
  infra/
    main.ts
    app.module.ts
    env/{env.ts, env.service.ts, env.module.ts}
    database/{database.module.ts, prisma/prisma.service.ts}
    http/{http.module.ts, controllers/health.controller.ts}
```

---

## Task 1: Project config files

**Create `intranet-backend/package.json`:**
```json
{
  "name": "intranet-backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "start": "nest start",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/infra/main",
    "lint": "eslint \"{src,test}/**/*.ts\" --fix",
    "test": "vitest run",
    "test:e2e": "vitest run --config ./vitest.config.e2e.ts",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev"
  },
  "prisma": { "seed": "ts-node prisma/seed.ts" },
  "dependencies": {
    "@nestjs/common": "^10.2.5",
    "@nestjs/config": "^3.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.1.0",
    "@nestjs/passport": "^10.0.1",
    "@nestjs/platform-express": "^10.0.0",
    "@prisma/client": "^5.2.0",
    "bcryptjs": "^2.4.3",
    "class-validator": "^0.14.0",
    "dayjs": "^1.11.9",
    "passport-jwt": "^4.0.1",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.1",
    "zod": "^3.22.2"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@swc/core": "^1.3.78",
    "@types/bcryptjs": "^2.4.2",
    "@types/express": "^4.17.17",
    "@types/node": "^20.3.1",
    "@types/passport-jwt": "^3.0.9",
    "prisma": "^5.2.0",
    "ts-node": "^10.9.1",
    "typescript": "^5.1.3",
    "unplugin-swc": "^1.3.2",
    "vite-tsconfig-paths": "^4.2.0",
    "vitest": "^0.34.2"
  }
}
```

**Copy these from `$TEMPLATE` verbatim (identical content):** `tsconfig.json`, `tsconfig.build.json`, `nest-cli.json`, `vitest.config.ts`, `vitest.config.e2e.ts`, `.eslintrc.json`.
- [ ] `cp $TEMPLATE/tsconfig.json $TEMPLATE/tsconfig.build.json $TEMPLATE/nest-cli.json $TEMPLATE/vitest.config.ts $TEMPLATE/vitest.config.e2e.ts $TEMPLATE/.eslintrc.json intranet-backend/`

**Create `intranet-backend/.gitignore`:**
```
node_modules
dist
.env
/data
*.log
```

**Create `intranet-backend/.env.example`:**
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:docker@localhost:5432/intranet?schema=public"
JWT_PRIVATE_KEY=""
JWT_PUBLIC_KEY=""
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=intranet
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
S3_FORCE_PATH_STYLE=true
```

**Create `intranet-backend/.env`** (gitignored; lets `prisma generate`/build run locally):
```env
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://postgres:docker@localhost:5432/intranet?schema=public"
FRONTEND_URL=http://localhost:3000
```

**Create `intranet-backend/docker-compose.yml`:**
```yaml
version: '3.8'
services:
  postgres:
    container_name: intranet-pg
    image: postgres:16
    ports:
      - 5432:5432
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: docker
      POSTGRES_DB: intranet
      PGDATA: /data/postgres
    volumes:
      - ./data/pg:/data/postgres
  minio:
    container_name: intranet-minio
    image: minio/minio
    command: server /data --console-address ":9001"
    ports:
      - 9000:9000
      - 9001:9001
    environment:
      MINIO_ROOT_USER: minio
      MINIO_ROOT_PASSWORD: minio123
    volumes:
      - ./data/minio:/data
```

- [ ] Create all the above files. Commit `chore(backend): add project config, env, docker-compose`.

## Task 2: Copy `core/` verbatim

- [ ] `mkdir -p intranet-backend/src && cp -R $TEMPLATE/src/core intranet-backend/src/core`
- [ ] Confirm 17 files copied: `find intranet-backend/src/core -type f | wc -l` → 17. These are framework-agnostic (Either, Entity, AggregateRoot, UniqueEntityID, ValueObject, WatchedList, DomainEvents, errors, pagination-params, optional) and need no changes.
- [ ] Commit `feat(backend): add core layer (copied from template)`.

## Task 3: Env module (adapted schema)

**Create `src/infra/env/env.ts`:**
```ts
import { z } from 'zod'

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().optional().default(3001),
  DATABASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  // Tightened in later phases: JWT (F2), S3 (F7)
  JWT_PRIVATE_KEY: z.string().optional(),
  JWT_PUBLIC_KEY: z.string().optional(),
  JWT_ACCESS_EXPIRES_IN: z.string().optional().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().optional().default('7d'),
  S3_ENDPOINT: z.string().url().optional(),
  S3_REGION: z.string().optional().default('us-east-1'),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
  S3_FORCE_PATH_STYLE: z.coerce.boolean().optional().default(true),
})

export type Env = z.infer<typeof envSchema>
```

**Copy `env.service.ts` and `env.module.ts` from `$TEMPLATE/src/infra/env/` verbatim** (they reference `./env`'s `Env` type, unchanged).
- [ ] Create env.ts; `cp $TEMPLATE/src/infra/env/env.service.ts $TEMPLATE/src/infra/env/env.module.ts intranet-backend/src/infra/env/`
- [ ] Commit `feat(backend): add Zod-validated env module`.

## Task 4: Prisma schema + service + database module

**Create `prisma/schema.prisma`** (minimal F0 — a single `User` model so a first migration/client exists; expanded in F2):
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String    @id @default(uuid())
  name         String
  email        String    @unique
  passwordHash String    @map("password_hash")
  isActive     Boolean   @default(true) @map("is_active")
  avatar       String?
  jobTitle     String?   @map("job_title")
  department   String?
  lastLoginAt  DateTime? @map("last_login_at")
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime? @updatedAt @map("updated_at")

  @@map("users")
}
```

**Copy `prisma.service.ts` from `$TEMPLATE/src/infra/database/prisma/prisma.service.ts` verbatim.**

**Create `src/infra/database/database.module.ts`** (minimal — no repositories yet):
```ts
import { Module } from '@nestjs/common'
import { PrismaService } from './prisma/prisma.service'

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
```
- [ ] Create the schema; `mkdir -p intranet-backend/src/infra/database/prisma && cp $TEMPLATE/src/infra/database/prisma/prisma.service.ts intranet-backend/src/infra/database/prisma/`; create database.module.ts.
- [ ] Commit `feat(backend): add Prisma schema, service and database module`.

## Task 5: Health controller + http module

**Create `src/infra/http/controllers/health.controller.ts`:**
```ts
import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'

@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    await this.prisma.$queryRaw`SELECT 1`
    return { status: 'ok', timestamp: new Date().toISOString() }
  }
}
```

**Create `src/infra/http/http.module.ts`:**
```ts
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { HealthController } from './controllers/health.controller'

@Module({
  imports: [DatabaseModule],
  controllers: [HealthController],
})
export class HttpModule {}
```
- [ ] Create both. Commit `feat(backend): add health endpoint`.

## Task 6: App module + main bootstrap

**Create `src/infra/app.module.ts`:**
```ts
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env/env'
import { EnvModule } from './env/env.module'
import { DatabaseModule } from './database/database.module'
import { HttpModule } from './http/http.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    EnvModule,
    DatabaseModule,
    HttpModule,
  ],
})
export class AppModule {}
```

**Create `src/infra/main.ts`:**
```ts
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { EnvService } from './env/env.service'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.setGlobalPrefix('api/v1')

  const env = app.get(EnvService)
  app.enableCors({ origin: env.get('FRONTEND_URL'), credentials: true })

  await app.listen(env.get('PORT'))
}
bootstrap()
```
- [ ] Create both. Commit `feat(backend): add app module and bootstrap (global prefix /api/v1, CORS)`.

## Task 7: Install, generate, build — GATE

- [ ] From `intranet-backend/`: `pnpm install` → succeeds (lockfile created).
- [ ] `pnpm prisma generate` → "Generated Prisma Client" (validates the schema; no DB needed).
- [ ] `pnpm build` → `nest build` succeeds, `dist/infra/main.js` exists. This is the authoritative gate available in this environment.
- [ ] **[needs Docker]** Document (do NOT fail the task if Docker is absent): the runtime check to run on a machine with Docker:
  ```
  cd intranet-backend
  cp .env.example .env   # fill JWT keys if desired (not required for F0)
  docker compose up -d postgres minio
  pnpm prisma migrate dev --name init
  pnpm start:dev
  curl http://localhost:3001/api/v1/health   # -> {"status":"ok","timestamp":"..."}
  ```
- [ ] Commit `chore(backend): add pnpm lockfile` (commit the generated `pnpm-lock.yaml`; do NOT commit `node_modules`, `dist`, `.env`, or `/data`).

---

## Done Criteria
- `intranet-backend/` holds the config, `core/`, env module, Prisma schema+service, health endpoint, app bootstrap.
- `pnpm install`, `pnpm prisma generate`, and `pnpm build` all succeed in this environment.
- `pnpm-lock.yaml` committed; `node_modules`/`dist`/`.env`/`data` gitignored.
- Runtime boot + `GET /api/v1/health` documented for a Docker-capable machine.

## Next (not in this plan)
- **F1 — base transversal:** exception filter, Zod validation pipe (copy from template), cryptography module (bcrypt + JWT), storage module (S3), auth module (jwt strategy, guards, `@Public`, `@CurrentUser`).
- **F2 — iam/auth:** User entity + use-cases (authenticate/refresh/logout/me), expand Prisma schema, seed admin.
