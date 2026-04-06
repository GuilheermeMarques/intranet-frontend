# Plano de Desenvolvimento do Backend

Este documento define a base tecnica do backend da intranet, a estrutura inicial do projeto, a stack recomendada, o banco de dados, os modulos do monolito e a sequencia de desenvolvimento.

O objetivo e construir um backend unico em `intranet-backend`, integrado ao frontend ja existente em `intranet-frontend`, substituindo gradualmente os mocks ate a etapa final de integracao real.

## 1. Objetivo do backend

O backend deve atender estes dominios:

- autenticacao
- usuario atual
- permissoes por usuario
- preferencias do usuario
- dashboard
- clientes
- produtos
- estoque
- representantes
- pedidos
- orcamentos
- chamados
- prioridades de chamados
- tags de chamados
- anexos

O modelo de autorizacao principal nao sera baseado em `role` para navegacao. O frontend final ja trabalha com `permissions[]` por usuario, incluindo:

- permissoes de menu e submenu, como `menu.sales.orders`
- permissao administrativa, como `settings.permissions.manage`

## 2. Stack recomendada

## 2.1 Linguagem e framework

- Node.js 22 LTS
- TypeScript
- NestJS

Motivos:

- modulariza bem um monolito por dominio
- facilita guards, interceptors, pipes e validacao
- integra bem com Swagger, JWT, testes e upload
- reduz retrabalho quando o sistema crescer

## 2.2 ORM e banco

- PostgreSQL
- Prisma ORM

Motivos:

- schema centralizado e migrations simples
- boa ergonomia para relacoes entre usuarios, permissoes, tickets, pedidos e orcamentos
- tipagem forte no TypeScript

## 2.3 Autenticacao e seguranca

- JWT access token
- refresh token persistido
- bcrypt para hash de senha
- guards por permissao
- rate limit por rota critica

## 2.4 Documentacao e validacao

- Swagger / OpenAPI
- class-validator
- class-transformer

## 2.5 Testes

- Jest
- Supertest

## 2.6 Upload de anexos

- S3 compativel
- MinIO no ambiente local
- S3 real em homologacao/producao

## 2.7 Infra local

- Docker Compose
- PostgreSQL
- MinIO
- Redis opcional

Observacao:

- Redis nao precisa entrar na primeira entrega
- pode ser adicionado depois para cache, fila, rate limit distribuido e sessoes auxiliares

## 3. Estilo arquitetural

Arquitetura recomendada:

- monolito modular
- separacao por dominio
- API REST versionada em `/api/v1`
- contratos orientados pelo frontend atual

Estrutura base recomendada:

```text
intranet-backend/
  src/
    main.ts
    app.module.ts
    common/
      decorators/
      guards/
      interceptors/
      filters/
      pipes/
      dto/
      constants/
      utils/
    config/
      app.config.ts
      database.config.ts
      auth.config.ts
      storage.config.ts
    database/
      prisma/
        prisma.service.ts
      seeds/
    modules/
      auth/
      users/
      permissions/
      preferences/
      dashboard/
      clients/
      products/
      inventory/
      representatives/
      orders/
      budgets/
      tickets/
      ticket-priorities/
      ticket-tags/
      uploads/
      health/
    integrations/
      storage/
      mail/
    types/
  prisma/
    schema.prisma
    migrations/
    seed.ts
  test/
    e2e/
  docker/
  docker-compose.yml
  .env.example
  package.json
  tsconfig.json
```

## 4. Padroes tecnicos

## 4.1 API

- prefixo: `/api/v1`
- JSON em `camelCase`
- datas em ISO 8601
- IDs tecnicos em UUID
- codigos de negocio mantidos quando exigidos pelo frontend

Exemplos:

- cliente: `id` + `codigo`
- produto: `id` + `codigoProduto`
- orcamento: `id` + `number`

## 4.2 Respostas

Padrrao recomendado:

```json
{
  "data": {},
  "message": "Operacao realizada com sucesso"
}
```

Quando o frontend exigir nomes especificos, pode retornar:

```json
{
  "user": {},
  "client": {},
  "order": {},
  "ticket": {}
}
```

## 4.3 Erros

Formato recomendado:

```json
{
  "statusCode": 400,
  "message": "Descricao legivel",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Email invalido"
    }
  ]
}
```

## 4.4 Controle de acesso

O backend deve expor `permissions[]` no usuario autenticado.

Exemplos de chaves:

- `settings.permissions.manage`
- `menu.dashboard`
- `menu.catalog`
- `menu.clients`
- `menu.tickets`
- `menu.tickets.list`
- `menu.tickets.priorities`
- `menu.tickets.tags`
- `menu.budgets`
- `menu.inventory`
- `menu.sales`
- `menu.sales.representatives`
- `menu.sales.orders`

Regras:

- exibicao de menu no frontend depende dessas chaves
- acesso a rotas administrativas deve ser validado no backend
- `settings.permissions.manage` e obrigatoria para editar permissoes de outros usuarios

## 5. Banco de dados

## 5.1 Banco principal

- PostgreSQL

## 5.2 Tabelas principais

### autenticacao e acesso

- `users`
- `refresh_tokens`
- `user_preferences`
- `permissions`
- `user_permissions`

### negocio

- `clients`
- `products`
- `inventory_movements`
- `representatives`
- `orders`
- `order_items`
- `budgets`
- `budget_items`
- `ticket_priorities`
- `ticket_tags`
- `tickets`
- `ticket_tag_links`
- `ticket_messages`
- `ticket_attachments`

## 5.3 Campos obrigatorios por grupo

### `users`

- `id`
- `name`
- `email`
- `password_hash`
- `is_active`
- `avatar_url`
- `job_title`
- `department`
- `last_login_at`
- `created_at`
- `updated_at`

Campo opcional/legado:

- `role`

### `permissions`

- `id`
- `key`
- `name`
- `description`
- `category`
- `created_at`
- `updated_at`

### `user_permissions`

- `id`
- `user_id`
- `permission_id`
- `created_at`

Restricao:

- unique `(user_id, permission_id)`

### `clients`

- `id`
- `codigo`
- `nome`
- `cpf`
- `cep`
- `endereco`
- `cidade`
- `estado`
- `bairro`
- `numero`
- `complemento`
- `email`
- `telefone`
- `instagram`
- `data_ultima_compra`
- `quantidade_compras`
- `created_at`
- `updated_at`

### `products`

- `id`
- `codigo_produto`
- `nome_produto`
- `descricao_produto`
- `preco`
- `quantidade_estoque`
- `ultima_data_venda`
- `fornecedor`
- `categoria`
- `ativo`
- `created_at`
- `updated_at`

### `orders`

- `id`
- `order_code`
- `client_id`
- `client_code_snapshot`
- `client_name_snapshot`
- `status`
- `subtotal`
- `shipping_cost`
- `total`
- `notes`
- `created_by`
- `created_at`
- `updated_at`

### `order_items`

- `id`
- `order_id`
- `product_id`
- `product_code_snapshot`
- `product_name_snapshot`
- `quantity`
- `unit_price`
- `total`

### `budgets`

- `id`
- `number`
- `client_id`
- `client_name_snapshot`
- `responsible_user_id`
- `responsible_name_snapshot`
- `created_at`
- `validity_date`
- `status`
- `total`
- `updated_at`

### `budget_items`

- `id`
- `budget_id`
- `product_id`
- `product_code_snapshot`
- `product_name_snapshot`
- `quantity`
- `unit_price`
- `total`

### `tickets`

- `id`
- `title`
- `description`
- `status`
- `priority_id`
- `category`
- `reporter_user_id`
- `assignee_user_id`
- `created_at`
- `updated_at`

### `ticket_priorities`

- `id`
- `name`
- `color`
- `weight`
- `sla_hours`
- `description`
- `is_active`

### `ticket_tags`

- `id`
- `name`
- `color`
- `description`
- `category`
- `is_active`

### `ticket_messages`

- `id`
- `ticket_id`
- `author_user_id`
- `type`
- `content`
- `created_at`

### `ticket_attachments`

- `id`
- `ticket_id`
- `message_id`
- `file_name`
- `file_url`
- `mime_type`
- `size`
- `uploaded_by_user_id`
- `created_at`

## 5.4 Indices recomendados

- `clients(codigo)`
- `clients(nome)`
- `clients(cidade)`
- `products(codigo_produto)`
- `products(nome_produto)`
- `orders(order_code)`
- `budgets(number)`
- `tickets(status, updated_at)`
- `tickets(priority_id, status)`
- `ticket_messages(ticket_id, created_at)`
- `user_permissions(user_id, permission_id)`

## 6. Modulos do monolito

## 6.1 AuthModule

Responsavel por:

- login
- refresh token
- logout
- usuario autenticado

Rotas:

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `GET /auth/me`

## 6.2 UsersModule

Responsavel por:

- dados do usuario
- listagem de usuarios
- lookup de usuarios

Rotas:

- `GET /users`
- `GET /users/:id`
- `GET /users/lookup`
- `GET /me/profile`
- `PATCH /me/profile`

## 6.3 PermissionsModule

Responsavel por:

- catalogo de permissoes
- permissoes do usuario logado
- atribuicao de permissoes por usuario
- autorizacao da tela `/settings/permissions`

Rotas:

- `GET /me/permissions`
- `GET /permissions`
- `GET /users/:id/permissions`
- `PUT /users/:id/permissions`

Guard principal:

- `PermissionsGuard`

Decorator principal:

- `@RequirePermissions(...)`

## 6.4 PreferencesModule

Responsavel por:

- tema
- idioma
- sidebar expandida
- demais preferencias da conta

Rotas:

- `GET /me/preferences`
- `PATCH /me/preferences`

## 6.5 DashboardModule

Responsavel por:

- `GET /dashboard/summary`

## 6.6 ClientsModule

Responsavel por:

- CRUD de clientes
- filtros
- lookup de cidades
- detalhe por UUID e por codigo

Rotas:

- `GET /clients`
- `GET /clients/:id`
- `GET /clients/code/:codigo`
- `POST /clients`
- `PATCH /clients/:id`
- `DELETE /clients/:id`
- `GET /clients/lookups`

## 6.7 ProductsModule

Responsavel por:

- catalogo de produtos
- lookups

Rotas:

- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PATCH /products/:id`
- `DELETE /products/:id`
- `GET /products/lookups`

## 6.8 InventoryModule

Responsavel por:

- movimentacoes de estoque
- entrada e saida
- historico

Rotas:

- `GET /inventory/movements`
- `POST /inventory/movements`
- `GET /inventory/lookups`

## 6.9 RepresentativesModule

Responsavel por:

- listagem e filtros de representantes

Rotas:

- `GET /representatives`
- `GET /representatives/lookups`

## 6.10 OrdersModule

Responsavel por:

- pedidos
- itens do pedido
- mudanca de status

Rotas:

- `GET /orders`
- `GET /orders/:id`
- `POST /orders`
- `PATCH /orders/:id`
- `PATCH /orders/:id/status`

## 6.11 BudgetsModule

Responsavel por:

- orcamentos
- itens do orcamento

Rotas:

- `GET /budgets`
- `GET /budgets/:id`
- `POST /budgets`
- `PATCH /budgets/:id`
- `DELETE /budgets/:id`

## 6.12 TicketsModule

Responsavel por:

- chamados
- mensagens
- anexos
- kanban

Rotas:

- `GET /tickets`
- `GET /tickets/:id`
- `POST /tickets`
- `PATCH /tickets/:id`
- `DELETE /tickets/:id`
- `POST /tickets/:id/messages`
- `POST /tickets/:id/attachments`
- `GET /tickets/lookups`

## 6.13 TicketPrioritiesModule

Rotas:

- `GET /ticket-priorities`
- `POST /ticket-priorities`
- `PATCH /ticket-priorities/:id`
- `DELETE /ticket-priorities/:id`

## 6.14 TicketTagsModule

Rotas:

- `GET /ticket-tags`
- `POST /ticket-tags`
- `PATCH /ticket-tags/:id`
- `DELETE /ticket-tags/:id`

## 6.15 UploadsModule

Responsavel por:

- upload generico
- storage
- validacao de tipo e tamanho

## 7. Ambientes

Arquivos:

- `.env`
- `.env.example`
- `.env.local`
- `.env.test`

Variaveis minimas:

```env
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/intranet
JWT_ACCESS_SECRET=change_me
JWT_REFRESH_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
APP_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=intranet
S3_ACCESS_KEY=minio
S3_SECRET_KEY=minio123
S3_FORCE_PATH_STYLE=true
```

## 8. Seeds iniciais

O backend deve nascer com seed minimo para destravar o frontend:

- 1 usuario administrador com `settings.permissions.manage`
- permissoes base de menu e submenu
- prioridades de ticket
- tags de ticket
- alguns clientes
- alguns produtos
- alguns representantes

Exemplo de usuario inicial:

- email: `admin@empresa.com`
- senha: `admin123`

Esse seed e temporario para desenvolvimento.

## 9. Contratos criticos com o frontend

O frontend ja espera estes comportamentos:

- `GET /auth/me` retornando `permissions[]`
- menus visiveis baseados em `permissions[]`
- `GET /users` para alimentar a tela administrativa de permissoes
- `GET /users/:id/permissions` para carregar edicao detalhada
- `PUT /users/:id/permissions` para salvar atribuicoes
- `GET /me/preferences` e `PATCH /me/preferences`
- tickets usando `priority` como ID de prioridade
- pedidos e orcamentos com snapshots de nome e codigo, alem dos IDs reais

## 10. Etapas de desenvolvimento

## Etapa 0. Bootstrap do projeto

Entregas:

- iniciar NestJS
- configurar TypeScript
- configurar ESLint e Prettier
- configurar Swagger
- configurar Prisma
- subir PostgreSQL e MinIO com Docker Compose
- criar `.env.example`

Resultado esperado:

- backend sobe localmente
- healthcheck funcionando
- banco conectado

## Etapa 1. Base transversal

Entregas:

- configuracao central
- PrismaService
- exception filter global
- validation pipe global
- response interceptor
- logger
- modulo de health

Resultado esperado:

- base pronta para crescer sem refactor estrutural

## Etapa 2. Autenticacao e sessao

Entregas:

- `AuthModule`
- login
- refresh token
- logout
- `GET /auth/me`
- hash de senha
- seed do usuario admin

Resultado esperado:

- frontend consegue autenticar com API real

## Etapa 3. Usuarios, permissoes e preferencias

Entregas:

- `UsersModule`
- `PermissionsModule`
- `PreferencesModule`
- `PermissionsGuard`
- seeds de permissoes
- `GET /users`
- `GET /users/:id/permissions`
- `PUT /users/:id/permissions`
- `GET /me/permissions`
- `GET /me/preferences`
- `PATCH /me/preferences`

Resultado esperado:

- tela `/settings/permissions` pode sair do mock
- controle administrativo fica real

## Etapa 4. Clientes

Entregas:

- CRUD de clientes
- filtros
- detalhe por codigo
- lookup de cidades

Resultado esperado:

- paginas `/clients` e `/clients/[id]` podem sair do mock

## Etapa 5. Produtos e estoque

Entregas:

- CRUD de produtos
- lookups
- movimentacoes de estoque
- motivos e tipos

Resultado esperado:

- `/catalog`, `/inventory` e `/inventory/new` deixam de depender de mocks

## Etapa 6. Representantes, pedidos e orcamentos

Entregas:

- representantes
- pedidos
- itens de pedido
- mudanca de status
- orcamentos
- itens de orcamento

Resultado esperado:

- `/sales/representatives`
- `/sales/orders`
- `/sales/orders/new`
- `/sales/orders/[id]`
- `/budgets`

todos passam a usar backend real

## Etapa 7. Tickets, prioridades, tags e anexos

Entregas:

- CRUD de tickets
- mensagens
- anexos
- prioridades
- tags
- lookups

Resultado esperado:

- `/tickets`
- `/tickets/priorities`
- `/tickets/tags`

passam a usar API real

## Etapa 8. Dashboard

Entregas:

- agregados de resumo
- cards
- progresso
- atividade recente

Resultado esperado:

- `/home` deixa de depender de mocks

## Etapa 9. Hardening

Entregas:

- testes unitarios
- testes e2e
- ajuste fino de indices
- auditoria de permissoes
- logs e observabilidade
- rate limit em rotas sensiveis

Resultado esperado:

- backend pronto para homologacao

## Etapa 10. Remocao dos mocks do frontend e integracao final

Esta e a ultima etapa.

Entregas:

- substituir `src/mocks/*` por chamadas reais
- trocar `localStorage` da tela `/settings/permissions` por API real
- alinhar hooks e services do frontend aos endpoints finais
- revisar estados de loading, erro e empty state
- validar fluxo completo de login ate logout
- validar navegacao por permissao real

Resultado esperado:

- frontend 100% apontado para o backend
- mocks removidos ou mantidos apenas para teste/dev isolado
- contratos estabilizados

## 11. Ordem recomendada de inicio imediato

Se o desenvolvimento comecar agora, a ordem mais pragmatica e:

1. bootstrap NestJS + Prisma + Docker Compose
2. auth
3. users + permissions + preferences
4. clients
5. products + inventory
6. representatives + orders + budgets
7. tickets + priorities + tags + uploads
8. dashboard
9. remocao dos mocks do frontend

## 12. Criterio de pronto

O backend sera considerado pronto para a integracao final quando:

- todas as rotas criticas do frontend existirem
- `permissions[]` vierem do backend
- a tela `/settings/permissions` salvar em API real
- login e sessao usarem backend real
- clientes, produtos, pedidos, orcamentos e tickets estiverem sem mock
- o frontend puder rodar apontando apenas para a API
