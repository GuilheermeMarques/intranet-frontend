# Design — Backend da Intranet (NestJS Clean Architecture)

- **Data:** 2026-06-16
- **Repositório:** `intranet-backend/` (monorepo com `intranet-frontend/`)
- **Template base:** `/Users/guilherme/www/studies/05-nest-clean` (Clean Architecture / DDD)
- **Status:** Aprovado para escrita de plano de implementação

## 1. Objetivo

Construir o backend de `intranet-backend` que atende, ponta a ponta, todas as rotas e
contratos já desenvolvidos no `intranet-frontend`, substituindo gradualmente os mocks
(`src/mocks/*`, `src/infrastructure/services/api.ts`, NextAuth mockado) por uma API REST real.

A arquitetura, organização de pastas, contratos internos (use-cases com `Either`,
repositórios, presenters, mappers, Zod pipes, auth JWT) **espelham fielmente** o template
`05-nest-clean`. O documento antigo `intranet-backend/BACKEND_DEVELOPMENT_PLAN.md` (que
propunha arquitetura `modules/common/config` com class-validator) fica **substituído por
esta spec**.

## 2. Decisões de design (confirmadas)

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Autenticação | **JWT nativo do backend** — frontend abandona NextAuth e chama `POST /sessions` (access + refresh token) |
| 2 | Fidelidade arquitetural | **DDD completo em todos os módulos** (use-cases com `Either`, entidades, presenters, mappers, repositórios in-memory para teste) |
| 3 | Escopo da spec | **Backend completo** documentado; **implementação faseada** |
| 4 | Formato de resposta | **Shapes diretos compatíveis com o front** (objetos nomeados por recurso, sem envelope `{data,message}`) |
| 5 | Idioma dos contratos | **Inglês (camelCase) em tudo**; inclui workstream de refactor PT→EN no frontend |
| 6 | Bounded contexts | **A — 3 contexts**: `iam`, `sales`, `support` + módulo `dashboard` de leitura |

## 3. Stack

- Node.js 22 LTS, TypeScript, **NestJS 10**
- **Prisma** + **PostgreSQL**
- **Zod** + `ZodValidationPipe` (validação por controller, como no template)
- **Passport-JWT** (RS256, chaves pública/privada via env), **bcryptjs**
- **@aws-sdk/client-s3** para storage S3-compatível (**MinIO** local)
- **Vitest** + Supertest (unit com repositórios in-memory + e2e)
- `@nestjs/throttler` (rate limit, fase de hardening), `helmet`, CORS
- Docker Compose (postgres + minio); Redis opcional na fase de hardening

## 4. Estrutura de pastas

```text
intranet-backend/
  src/
    core/                          # COPIADO do template, sem mudanças
      either.ts
      entities/                    # Entity, AggregateRoot, UniqueEntityID, ValueObject, WatchedList
      errors/                      # ResourceNotFoundError, NotAllowedError, UseCaseError
      events/                      # DomainEvents, DomainEvent, EventHandler
      repositories/pagination-params.ts
      types/optional.ts

    domain/
      iam/
        enterprise/entities/       # User, RefreshToken, Permission, UserPermission, UserPreferences
        application/
          use-cases/               # + .spec.ts (in-memory)
          repositories/            # UsersRepository, RefreshTokensRepository, PermissionsRepository,
                                   #   UserPermissionsRepository, PreferencesRepository
          cryptography/            # Encrypter, HashComparer, HashGenerator (COPIADO)
          use-cases/errors/        # WrongCredentialsError, ...
      sales/
        enterprise/entities/       # Client, Product, InventoryMovement, Representative,
                                   #   Order, OrderItem, Budget, BudgetItem (+ listas watched)
        application/
          use-cases/
          repositories/
      support/
        enterprise/entities/       # Ticket, TicketMessage, TicketAttachment, Priority, Tag
                                   #   + value-objects/ticket-with-details
        application/
          use-cases/
          repositories/
          storage/                 # Uploader (COPIADO)

    infra/
      main.ts, app.module.ts
      env/                         # env.ts (Zod), env.service.ts, env.module.ts
      auth/                        # jwt.strategy, jwt-auth.guard, current-user-decorator, public.ts
                                   #   + permissions.guard.ts, require-permissions.decorator.ts (NOVO)
      cryptography/                # bcrypt-hasher, jwt-encrypter, cryptography.module (COPIADO)
      storage/                     # s3-storage.ts (adaptado do r2-storage), storage.module
      database/
        prisma/
          prisma.service.ts        # COPIADO
          mappers/                 # 1 por entidade
          repositories/            # Prisma<Entity>Repository
      http/
        controllers/               # 1 por rota/use-case
        presenters/                # 1 por entidade -> shape EN do front
        pipes/zod-validation-pipe.ts
      cache/                       # opcional (hardening): redis-cache-repository (COPIADO)
  prisma/
    schema.prisma
    migrations/
    seed.ts
  test/
    repositories/                  # repositórios in-memory
    factories/                     # factories Prisma para e2e
    setup-e2e.ts
  docker-compose.yml
  .env.example
```

### Princípios herdados do template

- Todo use-case retorna `Either<Error, Success>`; o controller faz `switch` no erro → exceção HTTP.
- Repositórios são **interfaces no domínio**, implementadas com Prisma na `infra` e com versões
  **in-memory** em `test/repositories/` para os testes unitários dos use-cases.
- Validação de entrada via **Zod pipe** por controller.
- 1 controller por rota; 1 presenter por entidade convertendo para o shape EN consumido pelo front.
- Cada fase é uma *vertical slice* completa: entity → use-cases + specs in-memory → prisma repo +
  mapper → controller + presenter → e2e.

## 5. Modelo de domínio

### 5.1 Context `iam`

- **User** — `name, email, passwordHash, isActive, avatar, jobTitle, department, lastLoginAt`
- **Permission** — `key, name, description, category` (catálogo; ex.: `menu.sales.orders`, `settings.permissions.manage`)
- **UserPermission** — vínculo `userId ↔ permissionId` (fonte do `permissions[]`); unique `(userId, permissionId)`
- **RefreshToken** — `userId, token, expiresAt, revokedAt`
- **UserPreferences** — `userId, theme, language, sidebarCollapsed` (1:1 com User)

### 5.2 Context `sales`

- **Client** — `code, name, document, zipCode, street, city, state, neighborhood, number, complement, email, phone, instagram, lastPurchaseAt, purchaseCount`
- **Product** — `code, name, description, price, stockQuantity, lastSaleAt, supplier, category, active, imageUrl`
- **InventoryMovement** — `productId, productCode, description, quantity, type(inbound|outbound), occurredAt, reason, handledBy, notes`
- **Representative** — `name, email, phone, region, status, totalSales, monthlyGoal, clientsCount, lastActivity, avatar` (já em inglês no mock)
- **Order** (AggregateRoot) + **OrderItem** — snapshots `clientCode/clientName`, item com `productCode/productName`; `status(pending|shipped|delivered|canceled), shippingCost, notes, subtotal, total, createdBy`
- **Budget** (AggregateRoot) + **BudgetItem** — `number, clientId(+snapshot), responsibleId(+snapshot), status(pending|approved|rejected|expired), validityDate, total`

### 5.3 Context `support`

- **Ticket** (AggregateRoot) — `title, description, status(todo|inProgress|inReview|done), priorityId, category, reporterId, assigneeId, tags[]`
- **TicketMessage** — `ticketId, authorId, type(comment|status_update|assignment), content`
- **TicketAttachment** — `ticketId, messageId?, fileName, fileUrl, mimeType, size, uploadedById`
- **Priority** — `name, color, level, slaHours?, description, isActive`
- **Tag** — `name, color, description, category, isActive`
- Value-object **TicketWithDetails** — junta priority, tags e assignee/reporter resolvidos para a tela

### 5.4 Snapshots e referências cruzadas

Order/Budget/Ticket referenciam `User`/`Client`/`Product` por **ID**, sem importar entidades de
outro context. Campos `*Name`/`*Code` são **snapshots** persistidos no momento da criação — preservam
o histórico mesmo se o cadastro original mudar e mantêm os contexts desacoplados.

## 6. Schema Prisma (tabelas e índices)

Tabelas: `users`, `permissions`, `user_permissions` (unique `user_id+permission_id`),
`refresh_tokens`, `user_preferences`, `clients`, `products`, `inventory_movements`,
`representatives`, `orders`, `order_items`, `budgets`, `budget_items`, `ticket_priorities`,
`ticket_tags`, `tickets`, `ticket_tag_links` (N:N ticket↔tag), `ticket_messages`,
`ticket_attachments`.

- IDs em **UUID**; colunas em snake_case via `@map` (padrão do template).
- Índices: `clients(code)`, `clients(name)`, `clients(city)`, `products(code)`, `products(name)`,
  `orders(order_code)`, `budgets(number)`, `tickets(status, updated_at)`,
  `tickets(priority_id, status)`, `ticket_messages(ticket_id, created_at)`,
  `user_permissions(user_id, permission_id)`.

## 7. Contratos de API

Prefixo `/api/v1`. Rotas protegidas exigem `Authorization: Bearer <token>` salvo `@Public`.
Listas retornam objeto nomeado (ex.: `{ clients: [...] }`) ou paginado `{ items, total, page, limit }`
quando houver paginação; item único retorna objeto nomeado. camelCase, datas ISO 8601, dinheiro `number`.

### 7.1 iam

```
POST   /sessions                 @Public  → { accessToken, refreshToken }       (email, password)
POST   /sessions/refresh         @Public  → { accessToken, refreshToken }       (refreshToken)
POST   /sessions/logout                   → 204                                 (revoga refresh)
GET    /me                                → { user: { id,name,email,jobTitle,department,avatar,permissions[] } }
GET    /me/preferences                    → { preferences: { theme,language,sidebarCollapsed } }
PATCH  /me/preferences                    → { preferences }
GET    /users                             → { users: [AccessControlUser] }       (RequirePermissions: settings.permissions.manage)
GET    /users/:id/permissions             → { permissions: string[] }
PUT    /users/:id/permissions             → { permissions: string[] }            (RequirePermissions: settings.permissions.manage)
GET    /permissions                       → { permissions: [{ key,name,description,category }] }
```

`AccessControlUser = { id, name, email, jobTitle, department, status, lastLogin, avatar, permissions[] }`
(igual a `types/accessControl.ts`).

### 7.2 sales

```
GET    /clients              ?code&name&city&startDate&endDate         → { clients[], cities[] }
GET    /clients/:id                                                    → { client }
GET    /clients/code/:code                                             → { client }
POST   /clients                                                        → { client }
PATCH  /clients/:id                                                    → { client }
DELETE /clients/:id                                                    → 204
GET    /clients/lookups                                                → { cities[] }

GET    /products             ?code&name&category&supplier              → { products[] }
GET    /products/:id  ·  POST  ·  PATCH  ·  DELETE                     → { product }
GET    /products/lookups                                               → { categories[], suppliers[] }

GET    /inventory/movements  ?productCode&description&type&startDate&endDate → { movements[] }
POST   /inventory/movements                                            → { movement }
GET    /inventory/lookups                                              → { types[], reasons[] }

GET    /representatives      ?name&region&status                       → { representatives[] }
GET    /representatives/lookups                                        → { regions[] }

GET    /orders               ?orderCode&clientName&status              → { orders[] }
GET    /orders/:id  ·  POST  ·  PATCH                                  → { order }
PATCH  /orders/:id/status                                              → { order }   (body: { status })

GET    /budgets              ?budgetNumber&clientId&responsibleId&status&startDate&endDate → { budgets[] }
GET    /budgets/:id  ·  POST  ·  PATCH  ·  DELETE                      → { budget }
```

### 7.3 support

```
GET    /tickets              ?search&priority&status&category&assignee → { tickets[] }
GET    /tickets/:id  ·  POST  ·  PATCH  ·  DELETE                      → { ticket }   (inclui messages[], tags[], priority resolvido)
POST   /tickets/:id/messages                                          → { message }
POST   /tickets/:id/attachments    (multipart/form-data)              → { attachment }
GET    /tickets/lookups                                               → { categories[], assignees[] }

GET    /ticket-priorities  ·  POST  ·  PATCH  ·  DELETE               → { priorities[] } / { priority }
GET    /ticket-tags        ·  POST  ·  PATCH  ·  DELETE               → { tags[] } / { tag }
```

### 7.4 dashboard

```
GET    /dashboard/summary    → { stats[], progress[], recentActivity[] }    (shape espelha mocks/home.json)
```

### 7.5 Convenções transversais

- **Erros**: exception filter global → `{ statusCode, message, error, details?[] }`.
  Mapeamento dos `Left`: `ResourceNotFoundError`→404, `NotAllowedError`→403,
  `WrongCredentialsError`→401, erro de validação Zod→400.
- **Paginação** opcional `page/limit/sortBy/sortOrder` nos GETs de lista (default sem paginar,
  por compatibilidade com o front atual).

## 8. Autenticação, autorização e segurança

### 8.1 Fluxo de autenticação (JWT nativo)

- `POST /sessions` → `AuthenticateUseCase`: valida email/senha (`HashComparer`/bcrypt), emite
  **access token** (JWT RS256, ~15min) via `Encrypter` e cria **refresh token** persistido
  (`refresh_tokens`, ~7d). Atualiza `lastLoginAt`.
- `POST /sessions/refresh` → valida refresh token na base (não expirado/revogado) e **rotaciona**
  (revoga o antigo, emite novo par).
- `POST /sessions/logout` → revoga o refresh token atual.
- `jwt.strategy` valida com `JWT_PUBLIC_KEY` e injeta `UserPayload { sub }`. `@CurrentUser()`,
  `@Public()` e `JwtAuthGuard` (global via `APP_GUARD`) copiados do template.

### 8.2 Autorização por permissão

- `GET /me` resolve `permissions[]` via `user_permissions → permissions.key`.
- **`PermissionsGuard` + `@RequirePermissions(...)`** (NOVO) protegem rotas administrativas
  (escrita de permissões de outros usuários). Menus são filtrados no front pelo `permissions[]`;
  qualquer rota sensível também valida no backend.
- Seed cria 1 admin (`admin@empresa.com`) com `settings.permissions.manage` + todas as `menu.*`,
  além do catálogo completo de `permissions`.

### 8.3 Segurança

- Senhas com bcrypt (`BcryptHasher`).
- `helmet` + CORS restrito a `FRONTEND_URL`.
- Rate limit (`@nestjs/throttler`) em `/sessions` e `/sessions/refresh` (fase de hardening).
- `ZodValidationPipe` por controller; `env.ts` valida variáveis na subida (falha rápida).
- Upload valida mimeType/size no `UploadAttachmentUseCase` (`InvalidAttachmentTypeError`),
  grava via `S3Storage` (MinIO local).

### 8.4 Variáveis de ambiente (`.env.example`)

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/intranet
JWT_PRIVATE_KEY=<base64>
JWT_PUBLIC_KEY=<base64>
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

## 9. Workstream de refactor do frontend (PT → EN)

Renomear os contratos PT→EN de forma isolada, **antes** de plugar o backend (afeta sobretudo
`Client`, `Product`, `InventoryMovement`; orders/budgets/tickets/representatives já estão em inglês).

### Mapeamento de campos

**Client:** `codigo→code, nome→name, cpf→document, cep→zipCode, endereco→street, cidade→city,
estado→state, bairro→neighborhood, numero→number, complemento→complement, telefone→phone,
dataUltimaCompra→lastPurchaseAt, quantidadeCompras→purchaseCount` (email, instagram inalterados).

**Product:** `codigoProduto→code, nomeProduto→name, descricaoProduto→description, preco→price,
quantidadeEstoque→stockQuantity, ultimaDataVenda→lastSaleAt, fornecedor→supplier,
categoria→category, ativo→active, imagem→imageUrl`.

**InventoryMovement:** `codigoProduto→productCode, descricao→description, quantidade→quantity,
tipo→type (entrada→inbound, saida→outbound), data→occurredAt, motivo→reason, responsavel→handledBy,
observacoes→notes`.

### Passos

1. `src/types/{client,product,inventory}.ts` → campos EN.
2. `src/domain/entities/*` e `src/infrastructure/services/api.ts` (mock) → mesmos nomes EN.
3. `src/mocks/*.json` → chaves EN (clients, products, inventory).
4. Componentes/páginas/hooks que leem esses campos (`app/clients`, `app/catalog`, `app/inventory`,
   `presentation/*`, `features/clients`).
5. Rodar Jest/Cypress a cada etapa para travar regressões.

Resultado: front 100% em inglês, ainda sobre mocks, já no contrato final do backend.

## 10. Faseamento da implementação

- **F0 — Bootstrap:** Nest + TS + Prisma + Docker (postgres+minio) + `core` copiado + env + health +
  Vitest. ✅ sobe local, DB conectado.
- **F1 — Base transversal:** PrismaService, exception filter, Zod pipe, cryptography, storage,
  auth module (strategy/guards/public).
- **F2 — iam/auth:** User entity, Authenticate + Refresh + Logout + `GET /me`, seed admin.
  ✅ front loga real.
- **F3 — iam/permissions + preferences:** catálogo, user-permissions, `PermissionsGuard`, preferences.
  ✅ `/settings/permissions` sai do mock.
- **F4 — sales/clients:** CRUD + filtros + lookups + detalhe por code.
- **F5 — sales/products + inventory:** CRUD products, lookups, movimentações.
- **F6 — sales/representatives + orders + budgets:** snapshots e change-status.
- **F7 — support:** tickets + messages + attachments (upload) + priorities + tags + lookups.
- **F8 — dashboard/summary.**
- **F9 — hardening:** throttler, índices finos, e2e, auditoria de permissões.
- **F10 — refactor do front (EN) + integração:** trocar mocks por API real, remover NextAuth,
  validar login→logout e navegação por permissão.

## 11. Critério de pronto

- Todas as rotas críticas do front existem e respondem nos shapes EN acima.
- `permissions[]` vêm do backend; `/settings/permissions` persiste via API real.
- Login/sessão usam JWT do backend (sem NextAuth).
- Clients, products, inventory, representatives, orders, budgets e tickets sem mock.
- Frontend roda apontando apenas para a API, com contratos 100% em inglês.

## 12. Seeds iniciais

- 1 admin `admin@empresa.com` com `settings.permissions.manage` + todas as `menu.*`.
- Catálogo completo de `permissions` (todas as chaves `menu.*` + administrativas).
- Prioridades e tags base de ticket.
- Alguns clients, products e representatives para destravar o front.
