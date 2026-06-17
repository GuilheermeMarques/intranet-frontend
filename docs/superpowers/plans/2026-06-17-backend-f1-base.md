# Backend F1 — Base Transversal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add the cross-cutting building blocks on top of F0 — Zod validation pipe, cryptography module (bcrypt + JWT), storage module (S3/MinIO), and the JWT auth module (strategy, guards, decorators) wired as a global guard — all mirroring the template `/Users/guilherme/www/studies/05-nest-clean` ($TEMPLATE).

**Architecture:** Per spec `docs/superpowers/specs/2026-06-16-intranet-backend-design.md`. Cross-context abstractions live in their owning bounded context: cryptography under `domain/iam/application/cryptography/`, storage under `domain/support/application/storage/`. AuthModule installs a global `JwtAuthGuard`; `/health` becomes `@Public`. After F1 the app is locked-down (only `/health` public) — the `/sessions` login endpoint arrives in F2.

**Tech Stack:** NestJS 10, Passport-JWT (RS256), bcryptjs, @aws-sdk/client-s3, Zod. Package manager pnpm.

**Working dir:** repo root; backend at `intranet-backend/`. Branch `feat/backend-f1`. $TEMPLATE = `/Users/guilherme/www/studies/05-nest-clean`.

**Env constraints:** No Docker/Postgres here. Gate = `pnpm install`, `pnpm prisma generate`, `pnpm build`. Boot needs Docker (documented in F0).

---

## Task 1: Zod validation pipe

- [ ] Add deps to `intranet-backend/package.json` dependencies: `"zod-validation-error": "^1.5.0"`. (Run `pnpm add zod-validation-error@^1.5.0` from `intranet-backend/`, or edit + `pnpm install`.)
- [ ] `mkdir -p intranet-backend/src/infra/http/pipes && cp $TEMPLATE/src/infra/http/pipes/zod-validation-pipe.ts intranet-backend/src/infra/http/pipes/` (verbatim).
- [ ] Commit `feat(backend): add Zod validation pipe`.

## Task 2: Cryptography (iam context)

**Create domain interfaces under `src/domain/iam/application/cryptography/`** — copy verbatim from `$TEMPLATE/src/domain/forum/application/cryptography/`:
- `encrypter.ts`, `hash-comparer.ts`, `hash-generator.ts`
- [ ] `mkdir -p intranet-backend/src/domain/iam/application/cryptography && cp $TEMPLATE/src/domain/forum/application/cryptography/{encrypter,hash-comparer,hash-generator}.ts intranet-backend/src/domain/iam/application/cryptography/`

**Create `src/infra/cryptography/bcrypt-hasher.ts`** (copy from template, fix import paths to `@/domain/iam/...`):
```ts
import { hash, compare } from 'bcryptjs'
import { HashComparer } from '@/domain/iam/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/iam/application/cryptography/hash-generator'

export class BcryptHasher implements HashGenerator, HashComparer {
  private HASH_SALT_LENGTH = 8

  hash(plain: string): Promise<string> {
    return hash(plain, this.HASH_SALT_LENGTH)
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return compare(plain, hash)
  }
}
```

**Create `src/infra/cryptography/jwt-encrypter.ts`:**
```ts
import { Encrypter } from '@/domain/iam/application/cryptography/encrypter'
import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtEncrypter implements Encrypter {
  constructor(private jwtService: JwtService) {}

  encrypt(payload: Record<string, unknown>): Promise<string> {
    return this.jwtService.signAsync(payload)
  }
}
```

**Create `src/infra/cryptography/cryptography.module.ts`:**
```ts
import { Module } from '@nestjs/common'
import { Encrypter } from '@/domain/iam/application/cryptography/encrypter'
import { HashComparer } from '@/domain/iam/application/cryptography/hash-comparer'
import { HashGenerator } from '@/domain/iam/application/cryptography/hash-generator'
import { JwtEncrypter } from './jwt-encrypter'
import { BcryptHasher } from './bcrypt-hasher'

@Module({
  providers: [
    { provide: Encrypter, useClass: JwtEncrypter },
    { provide: HashComparer, useClass: BcryptHasher },
    { provide: HashGenerator, useClass: BcryptHasher },
  ],
  exports: [Encrypter, HashComparer, HashGenerator],
})
export class CryptographyModule {}
```
- [ ] Create the four infra/domain files. Commit `feat(backend): add cryptography module (bcrypt + JWT)`.

## Task 3: Storage (support context)

**Create `src/domain/support/application/storage/uploader.ts`** — copy verbatim from `$TEMPLATE/src/domain/forum/application/storage/uploader.ts`:
- [ ] `mkdir -p intranet-backend/src/domain/support/application/storage && cp $TEMPLATE/src/domain/forum/application/storage/uploader.ts intranet-backend/src/domain/support/application/storage/`

**Create `src/infra/storage/s3-storage.ts`** (adapted from template's `r2-storage.ts` for generic S3/MinIO):
```ts
import { UploadParams, Uploader } from '@/domain/support/application/storage/uploader'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Injectable } from '@nestjs/common'
import { EnvService } from '../env/env.service'
import { randomUUID } from 'node:crypto'

@Injectable()
export class S3Storage implements Uploader {
  private client: S3Client

  constructor(private envService: EnvService) {
    this.client = new S3Client({
      endpoint: envService.get('S3_ENDPOINT'),
      region: envService.get('S3_REGION'),
      forcePathStyle: envService.get('S3_FORCE_PATH_STYLE'),
      credentials: {
        accessKeyId: envService.get('S3_ACCESS_KEY') ?? '',
        secretAccessKey: envService.get('S3_SECRET_KEY') ?? '',
      },
    })
  }

  async upload({ fileName, fileType, body }: UploadParams): Promise<{ url: string }> {
    const uploadId = randomUUID()
    const uniqueFileName = `${uploadId}-${fileName}`

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.envService.get('S3_BUCKET'),
        Key: uniqueFileName,
        ContentType: fileType,
        Body: body,
      }),
    )

    return { url: uniqueFileName }
  }
}
```
(If `pnpm build` reports a strict-null type error on `endpoint`/`region`/`Bucket` because the S3 env vars are optional, resolve minimally — e.g. coerce with `?? ''` or a non-null assertion — and note it. These vars become required in F7.)

**Create `src/infra/storage/storage.module.ts`:**
```ts
import { Uploader } from '@/domain/support/application/storage/uploader'
import { Module } from '@nestjs/common'
import { S3Storage } from './s3-storage'
import { EnvModule } from '../env/env.module'

@Module({
  imports: [EnvModule],
  providers: [{ provide: Uploader, useClass: S3Storage }],
  exports: [Uploader],
})
export class StorageModule {}
```
- [ ] Create the three files. Commit `feat(backend): add S3/MinIO storage module`.

## Task 4: Auth module + global guard + env tightening

**Copy these from `$TEMPLATE/src/infra/auth/` verbatim** into `src/infra/auth/`:
- `jwt.strategy.ts`, `jwt-auth.guard.ts`, `public.ts`, `current-user-decorator.ts`, `auth.module.ts`
- [ ] `mkdir -p intranet-backend/src/infra/auth && cp $TEMPLATE/src/infra/auth/{jwt.strategy.ts,jwt-auth.guard.ts,public.ts,current-user-decorator.ts,auth.module.ts} intranet-backend/src/infra/auth/`

**Tighten `src/infra/env/env.ts`** — make JWT keys REQUIRED (the strategy/JwtModule read them at boot):
- Change `JWT_PRIVATE_KEY: z.string().optional()` → `JWT_PRIVATE_KEY: z.string()`
- Change `JWT_PUBLIC_KEY: z.string().optional()` → `JWT_PUBLIC_KEY: z.string()`
- Leave S3 vars optional (storage not wired into app yet; tightened in F7).

**Mark health public** — edit `src/infra/http/controllers/health.controller.ts`:
```ts
import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { Public } from '@/infra/auth/public'

@Controller('health')
@Public()
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    await this.prisma.$queryRaw`SELECT 1`
    return { status: 'ok', timestamp: new Date().toISOString() }
  }
}
```

**Wire AuthModule into `src/infra/app.module.ts`** — add the import:
```ts
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { envSchema } from './env/env'
import { EnvModule } from './env/env.module'
import { DatabaseModule } from './database/database.module'
import { HttpModule } from './http/http.module'
import { AuthModule } from './auth/auth.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    AuthModule,
    EnvModule,
    DatabaseModule,
    HttpModule,
  ],
})
export class AppModule {}
```

**Generate sample JWT keys into `.env`** (gitignored) so the app can boot locally, and document generation in `.env.example`:
- [ ] Run from `intranet-backend/`:
```bash
node -e "const {generateKeyPairSync}=require('crypto');const {privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});const fs=require('fs');let e=fs.readFileSync('.env','utf8');e=e.replace(/JWT_PRIVATE_KEY=.*/g,'').replace(/JWT_PUBLIC_KEY=.*/g,'').trimEnd();e+='\nJWT_PRIVATE_KEY='+Buffer.from(privateKey).toString('base64')+'\nJWT_PUBLIC_KEY='+Buffer.from(publicKey).toString('base64')+'\n';fs.writeFileSync('.env',e);console.log('wrote JWT keys to .env')"
```
  (If `.env` lacks the JWT lines, this appends them; `.env` is gitignored so keys are NOT committed.)
- [ ] In `.env.example`, replace the empty `JWT_PRIVATE_KEY=""` / `JWT_PUBLIC_KEY=""` lines with a comment documenting generation:
```env
# Generate an RS256 keypair (base64-encoded PEM), e.g.:
#   node -e "const{generateKeyPairSync}=require('crypto');const{privateKey,publicKey}=generateKeyPairSync('rsa',{modulusLength:2048,publicKeyEncoding:{type:'spki',format:'pem'},privateKeyEncoding:{type:'pkcs8',format:'pem'}});console.log('JWT_PRIVATE_KEY='+Buffer.from(privateKey).toString('base64'));console.log('JWT_PUBLIC_KEY='+Buffer.from(publicKey).toString('base64'))"
JWT_PRIVATE_KEY=""
JWT_PUBLIC_KEY=""
```
- [ ] Commit `feat(backend): add JWT auth module with global guard; require JWT env; public health`.

## Task 5: Gate

- [ ] From `intranet-backend/`: `pnpm install` → success.
- [ ] `pnpm prisma generate` → success.
- [ ] `pnpm build` → success; `dist/infra/main.js` exists.
- [ ] `git status` → confirm `.env`, `node_modules`, `dist` NOT staged.
- [ ] Commit any lockfile change `chore(backend): update lockfile for F1 deps`.
- [ ] **[needs Docker]** runtime check (document, do not run here): with `.env` JWT keys set + Postgres up, `pnpm start:dev` boots; `curl localhost:3001/api/v1/health` → ok; any other route → 401 (global guard active).

---

## Done Criteria
- Zod pipe, cryptography module (iam), storage module (support), and auth module (global guard) all present and compiling.
- `domain/iam/application/cryptography/*` and `domain/support/application/storage/*` interfaces in place.
- `/health` is `@Public`; env requires JWT keys; sample keys in gitignored `.env`; `.env.example` documents generation.
- `pnpm install` / `prisma generate` / `build` pass; nothing secret/generated committed.

## Next (F2 — iam/auth)
- `User` entity + mapper + Prisma repository; `AuthenticateUseCase`, refresh-token flow, `GET /me`; expand Prisma schema (permissions, refresh_tokens, preferences); seed admin; `POST /sessions` (`@Public`).
