# Requisitos do Backend para Intranet Corporativa

Este documento descreve o que o backend deve expor para suportar **todas as telas e fluxos** do frontend atual (Next.js + mocks em `src/mocks` e tipos em `src/types`). O backend sugerido é **NestJS** com **PostgreSQL** (Docker). Os contratos abaixo são a referência para alinhar payloads, nomes de campos (JSON em **camelCase**) e comportamentos.

---

## Mapa de funcionalidades (frontend → domínio)

| Rota / área no app | Origem dos dados hoje | Domínio API |
| ------------------ | --------------------- | ----------- |
| `/login` | NextAuth + credenciais mock | Autenticação |
| `/home` | `home.json` | Dashboard / agregados |
| `/clients`, `/clients/[codigo]` | `clients.json`, `purchases.json` | Clientes + compras |
| `/catalog` | `products.json` | Produtos (visão catálogo) |
| `/budgets` | `budgets.json`, `products.json`, `representatives.json` | Orçamentos |
| `/tickets` | `tickets.json`, `priorities.json`, `tags.json` | Chamados |
| `/tickets/priorities` | `priorities.json` | Prioridades (CRUD) |
| `/tickets/tags` | `tags.json` | Tags (CRUD) |
| `/inventory`, `/inventory/new` | `inventory.json`, `products.json` | Movimentações de estoque |
| `/sales/orders`, `/sales/orders/new`, `/sales/orders/[id]` | `orders.json`, `clients.json`, `products.json` | Pedidos |
| `/sales/representatives` | `representatives.json` | Representantes |
| `/settings` | `settings.json` + UI local (tema) | Configurações (opcional no backend) |

**Nota:** Existe também uma camada `src/domain/entities` e `src/infrastructure/services/api.ts` com contratos ligeiramente diferentes (ex.: tickets em português). A prioridade para o backend NestJS é atender **`src/types` + telas + mocks**; na integração, o frontend deve ser ajustado para consumir uma única API.

---

## Requisitos gerais

- **Framework:** NestJS  
- **Banco:** PostgreSQL (Docker)  
- **Autenticação:** JWT no header `Authorization: Bearer <token>` nas rotas protegidas (complementar ao NextAuth do frontend, se mantido)  
- **Resposta:** Todo retorno de sucesso em um **objeto JSON** (envelope), nunca corpo “solto” primitivo  
- **Datas:** ISO 8601 em string (`2025-07-15T10:30:00Z` ou `2025-07-15` onde for só data)  
- **IDs:** Preferir **UUID** string em novas APIs; o frontend hoje usa `id` numérico em produtos (mock) — o backend pode usar UUID e o frontend normaliza depois  
- **Paginação:** `page` (≥1), `limit` (padrão 10, máx. sugerido 100); resposta inclui `total`, `page`, `limit`  
- **Listagens auxiliares:** quando a UI precisa de selects (cidades, regiões, categorias), pode vir embutido na listagem (`cidades`, `regions`, etc.) ou em rotas dedicadas — abaixo está o que a UI espera hoje  

### Erros

Resposta sugerida (4xx/5xx), sempre JSON:

```json
{
  "statusCode": 400,
  "message": "Descrição legível",
  "error": "Bad Request",
  "details": [{ "field": "email", "message": "inválido" }]
}
```

`details` é opcional (validação).

---

## Convenções de URL (prefixo global)

Assumir prefixo configurável, ex.: `/api/v1`. Exemplos abaixo são **paths relativos** a esse prefixo.

---

## 1. Autenticação e sessão

### Estado atual no frontend

- Login com **NextAuth** (`CredentialsProvider`), usuários mock em `authConfig.ts` (email/senha, JWT de sessão NextAuth).

### Contratos recomendados para API Nest (integração futura)

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| POST | `/auth/login` | Email + senha → token de API |
| POST | `/auth/refresh` | (opcional) refresh token |
| GET | `/auth/me` | Usuário logado a partir do Bearer JWT |
| POST | `/auth/logout` | (opcional) invalidar refresh / blacklist |

**POST `/auth/login`** — body:

```json
{
  "email": "admin@empresa.com",
  "password": "••••••••"
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "name": "Administrador",
    "email": "admin@empresa.com",
    "role": "admin"
  },
  "accessToken": "jwt...",
  "expiresIn": 86400,
  "message": "Login realizado com sucesso"
}
```

**GET `/auth/me`** — response:

```json
{
  "user": {
    "id": "uuid",
    "name": "Administrador",
    "email": "admin@empresa.com",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T00:00:00.000Z"
  }
}
```

**Roles sugeridas (alinhar com NextAuth):** `admin`, `user` (expandir conforme RBAC).

---

## 2. Dashboard (Home)

Dados equivalentes a `src/mocks/home.json` para montar cards, progresso e atividade recente.

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/dashboard/summary` | Agregados para a home |

**Response sugerida:**

```json
{
  "stats": [
    {
      "title": "Total de Usuários",
      "value": "1,234",
      "icon": "People",
      "color": "primary",
      "trend": "este mês",
      "trendValue": "+12%"
    }
  ],
  "progress": [
    {
      "title": "Produtos no Catálogo",
      "value": 156,
      "total": 200,
      "color": "primary",
      "icon": "Inventory"
    }
  ],
  "recentActivity": [
    {
      "action": "Novo usuário registrado",
      "user": "João Silva",
      "time": "2 minutos atrás",
      "type": "user"
    }
  ]
}
```

`icon` / `color` / `type` são strings para a UI mapear (como hoje). Valores podem ser calculados no backend.

---

## 3. Clientes

Telas: listagem com filtros, modal de criação, detalhe por **código** na URL (`/clients/CLI001`).

### Modelo (alinhado a `src/types/client.ts` + listagem)

| Campo | Tipo | Obrigatório | Notas |
| ----- | ---- | ----------- | ----- |
| id | string (UUID) | sim | Para integração e DELETE/PUT |
| codigo | string | sim | Identificador de negócio; usado na rota de detalhe hoje |
| nome, cpf, cep, endereco, cidade, estado, bairro, numero | string | sim/não conforme regra de negócio | |
| complemento | string | não | Pode ser vazio |
| email, telefone, instagram | string | sim/não | |
| dataUltimaCompra | string (date) | sim | |
| quantidadeCompras | number | sim | |
| createdAt, updatedAt | string (ISO) | sim | |

### Rotas

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/clients` | Lista paginada + filtros |
| GET | `/clients/:identifier` | Detalhe por **id (UUID)** ou **codigo** (definir estratégia; recomenda-se query `?by=code` ou path único documentado) |
| POST | `/clients` | Criar |
| PUT/PATCH | `/clients/:id` | Atualizar (preferir UUID) |
| DELETE | `/clients/:id` | Remover |

**GET `/clients`** — query:

- `codigo`, `nome` — busca parcial (case insensitive)
- `cidade` — igualdade (valor exato para select)
- `dataInicial`, `dataFinal` — filtram **dataUltimaCompra**
- `page`, `limit`

**Response:**

```json
{
  "clients": [
    {
      "id": "uuid",
      "codigo": "CLI001",
      "nome": "João Silva",
      "cpf": "123.456.789-00",
      "cep": "01234-567",
      "endereco": "Rua das Flores",
      "cidade": "São Paulo",
      "estado": "SP",
      "bairro": "Centro",
      "numero": "123",
      "complemento": "Apto 45",
      "email": "joao.silva@email.com",
      "telefone": "(11) 99999-9999",
      "instagram": "@joao_silva",
      "dataUltimaCompra": "2024-01-15",
      "quantidadeCompras": 12,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-15T00:00:00.000Z"
    }
  ],
  "cidades": ["São Paulo", "Rio de Janeiro", "Belo Horizonte"],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

**POST `/clients`** — body (mesmos campos do modal, sem `codigo` gerado ou com regra de geração no servidor):

```json
{
  "nome": "João Silva",
  "cpf": "123.456.789-00",
  "cep": "01234-567",
  "endereco": "Rua das Flores",
  "cidade": "São Paulo",
  "estado": "SP",
  "bairro": "Centro",
  "numero": "123",
  "complemento": "Apto 45",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "instagram": "@joao_silva"
}
```

**Response:**

```json
{
  "client": { "...": "objeto completo com id e codigo gerados" },
  "message": "Cliente criado com sucesso"
}
```

---

## 4. Histórico de compras do cliente

Tela: aba “Compras” em `ClientDetails` — `src/types/purchase.ts` + `purchases.json`.

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/clients/:clientCode/purchases` | Lista compras onde `clientCode` = **codigo** do cliente |

**Item de compra (`products` dentro da compra):**

```json
{
  "name": "Produto A",
  "quantity": 2,
  "unitPrice": 500.0,
  "total": 1000.0
}
```

**Response:**

```json
{
  "purchases": [
    {
      "id": "PUR001",
      "clientCode": "CLI001",
      "orderNumber": "ORD001",
      "date": "2024-01-15",
      "total": 1250.0,
      "products": [
        {
          "name": "Produto A",
          "quantity": 2,
          "unitPrice": 500.0,
          "total": 1000.0
        }
      ]
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 10
}
```

(Se compras forem as mesmas que “pedidos”, pode unificar com a entidade de pedidos e apenas filtrar por cliente.)

---

## 5. Produtos (Catálogo + insumos de outras telas)

Usado em: `/catalog`, `/inventory/new`, novo pedido, itens de orçamento (nome de produto).

### Modelo (`src/types/product.ts`)

| Campo | Tipo | Notas |
| ----- | ---- | ----- |
| id | string (UUID recomendado) ou number (legado mock) | Normalizar no frontend |
| codigoProduto | string | |
| nomeProduto | string | |
| descricaoProduto | string | |
| preco | number | |
| quantidadeEstoque | number | |
| ultimaDataVenda | string (date) | |
| fornecedor | string | |

### Rotas

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/products` | Lista + filtros (catálogo) |
| GET | `/products/:id` | Detalhe |
| POST | `/products` | Criar |
| PUT/PATCH | `/products/:id` | Atualizar |
| DELETE | `/products/:id` | Remover |

**GET `/products`** — query:

- `codigoProduto`, `nomeProduto`, `descricaoProduto` — parcial
- `fornecedor` — exato ou parcial (definir)
- `precoMin`, `precoMax`
- `quantidadeEstoqueMin`, `quantidadeEstoqueMax`
- `page`, `limit`

**Response:**

```json
{
  "products": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "codigoProduto": "PROD001",
      "nomeProduto": "Notebook Dell Inspiron",
      "descricaoProduto": "Notebook 15\" ...",
      "preco": 3499.99,
      "quantidadeEstoque": 15,
      "ultimaDataVenda": "2025-07-15",
      "fornecedor": "Dell Brasil"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

**Catálogo:** a tela `/catalog` pode consumir **a mesma** `GET /products` (sem rota `/catalog` obrigatória). Se desejar cache diferente, `GET /catalog` pode ser alias com filtros fixos.

---

## 6. Pedidos (Orders)

Telas: lista, detalhe, novo pedido. Contrato alinhado a `src/types/order.ts` e `orders.json`.

### Modelo

- **Pedido:** `id`, `clientCode`, `clientName`, `clientEmail?`, `clientPhone?`, `items[]`, `total`, `shippingCost`, `status`, `createdAt`, `updatedAt?`, `notes?`
- **Item:** `id`, `productName`, `quantity`, `unitPrice`, `total` (total da linha)

**status:** `pending` | `shipped` | `delivered` | `canceled`

### Rotas

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/orders` | Lista + filtros |
| GET | `/orders/:id` | Detalhe |
| POST | `/orders` | Criar |
| PUT/PATCH | `/orders/:id` | Atualizar (status, itens, observações) |
| DELETE | `/orders/:id` | Cancelar/remover conforme regra |

**GET `/orders`** — query:

- `orderCode` — parcial em `id` ou número amigável
- `clientName` — parcial
- `status`
- `startDate`, `endDate` — `createdAt`
- `page`, `limit`

**POST `/orders`** — body (alinhado ao formulário + domínio):

```json
{
  "clientId": "uuid-do-cliente",
  "clientCode": "CLI001",
  "items": [
    {
      "productId": "uuid-produto",
      "quantity": 2,
      "unitPrice": 150.0
    }
  ],
  "shippingCost": 25.0,
  "notes": "Pedido urgente"
}
```

- Se `unitPrice` omitido, backend calcula pelo preço vigente do produto.  
- `clientCode` opcional se `clientId` obrigatório.

**Response POST:**

```json
{
  "order": {
    "id": "PED-001",
    "clientCode": "CLI001",
    "clientName": "João Silva",
    "clientEmail": "joao.silva@email.com",
    "clientPhone": "(11) 99999-9999",
    "items": [
      {
        "id": "ITEM-001",
        "productName": "Produto Premium A",
        "quantity": 2,
        "unitPrice": 150.0,
        "total": 300.0
      }
    ],
    "total": 450.0,
    "shippingCost": 25.0,
    "status": "pending",
    "createdAt": "2025-07-20T10:00:00.000Z",
    "updatedAt": "2025-07-20T10:00:00.000Z",
    "notes": "Pedido urgente"
  },
  "message": "Pedido criado com sucesso"
}
```

---

## 7. Orçamentos (Budgets)

Tela: lista, filtros, modal de novo orçamento (`validityDate`, itens com produto/quantidade/preço). Tipo base: `src/types/budget.ts`. Mock de lista não traz `validityDate`, mas o **formulário de criação** exige — o backend deve persistir e devolver nas respostas.

### Modelo

| Campo | Tipo |
| ----- | ---- |
| id | string (UUID) |
| number | string |
| client | string (nome ou id; definir; hoje é nome no mock) |
| responsible | string |
| createdAt | string (date) |
| validityDate | string (date) |
| status | `pending` \| `approved` \| `rejected` \| `expired` |
| total | number |
| items | `{ id, product, quantity, unitPrice, total }[]` |

### Rotas

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/budgets` | Lista + filtros + opcional lista de clientes/responsáveis para selects |
| GET | `/budgets/:id` | Detalhe |
| POST | `/budgets` | Criar |
| PUT/PATCH | `/budgets/:id` | Atualizar |
| DELETE | `/budgets/:id` | Remover |

**GET `/budgets`** — query: `budgetNumber`, `client`, `responsible`, `status`, `startDate`, `endDate`, `page`, `limit`

**POST `/budgets`** — body sugerido:

```json
{
  "client": "Empresa ABC Ltda",
  "responsible": "João Silva",
  "validityDate": "2025-08-15",
  "items": [
    {
      "productId": "uuid-opcional",
      "product": "Notebook Dell Inspiron",
      "quantity": 5,
      "unitPrice": 3000.0
    }
  ]
}
```

**Response:** `{ "budget": { ... }, "message": "..." }`

---

## 8. Chamados (Tickets)

Tela principal: quadro Kanban + modal detalhe, mensagens, anexos. Tipos: `src/types/ticket.ts`, dados: `tickets.json` + `statusConfig`.

### Estados (`status`)

`todo` | `inProgress` | `inReview` | `done`

### Modelo ticket

| Campo | Tipo |
| ----- | ---- |
| id | string |
| title | string |
| description | string |
| status | ver acima |
| priority | string (id da prioridade, ex. `priority-4`) |
| assignee | string |
| reporter | string |
| createdAt, updatedAt | string (ISO) |
| category | string |
| tags | string[] (ids de tags, ex. `tag-1`) |
| messages | ver §10 |

### Rotas principais

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/tickets` | Lista paginada ou completa para Kanban + metadados |
| GET | `/tickets/:id` | Detalhe com mensagens e anexos |
| POST | `/tickets` | Criar |
| PUT/PATCH | `/tickets/:id` | Atualizar (inclui mudança de status por drag) |
| DELETE | `/tickets/:id` | Remover |

**GET `/tickets`** — query:

- `search` — título/descrição
- `priority` — id
- `category`
- `assignee`
- `dataInicial`, `dataFinal` — `createdAt`
- `page`, `limit` (ou retorno completo se volume controlado)

**Metadado `statusConfig`:** pode vir na mesma response ou em `GET /tickets/meta`.

```json
{
  "tickets": [],
  "statusConfig": {
    "todo": { "label": "ToDo", "color": "#ff9800" },
    "inProgress": { "label": "InProgress", "color": "#2196f3" },
    "inReview": { "label": "In Review", "color": "#9c27b0" },
    "done": { "label": "Done", "color": "#4caf50" }
  },
  "total": 5,
  "page": 1,
  "limit": 50
}
```

**POST `/tickets`** — body:

```json
{
  "title": "Erro no login",
  "description": "Detalhes...",
  "priority": "priority-4",
  "category": "Sistema",
  "tags": ["tag-1", "tag-4"],
  "assignee": "João Silva",
  "reporter": "Maria Santos"
}
```

`reporter` pode ser preenchido pelo backend com o usuário autenticado.

---

## 9. Prioridades (CRUD)

Tela: `/tickets/priorities`. Modelo: `Priority` em `src/types/ticket.ts`.

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/priorities` | Lista |
| POST | `/priorities` | Criar |
| PUT/PATCH | `/priorities/:id` | Atualizar |
| DELETE | `/priorities/:id` | Remover |

**Campos:** `id`, `name`, `color`, `level` (1–5), `description?`, `isActive`

**GET response:**

```json
{
  "priorities": [
    {
      "id": "priority-1",
      "name": "Muito Baixa",
      "color": "#4caf50",
      "level": 1,
      "description": "...",
      "isActive": true
    }
  ]
}
```

---

## 10. Tags (CRUD)

Tela: `/tickets/tags`. Modelo: `Tag` em `src/types/ticket.ts`.

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/tags` | Lista (filtro opcional `category`, `isActive`) |
| POST | `/tags` | Criar |
| PUT/PATCH | `/tags/:id` | Atualizar |
| DELETE | `/tags/:id` | Remover |

**Campos:** `id`, `name`, `color`, `description?`, `isActive`, `category?`

---

## 11. Mensagens e anexos de chamados

### Mensagem (`Message`)

| Campo | Tipo |
| ----- | ---- |
| id | string |
| author | string |
| content | string |
| timestamp | string (ISO) |
| mentions | string[] (nomes ou ids) |
| type | `comment` \| `status_update` \| `assignment` |
| attachments | `Attachment[]` opcional |

### Anexo (`Attachment`)

| Campo | Tipo |
| ----- | ---- |
| id | string |
| name | string |
| url | string (URL pública ou assinada) |
| type | `image` \| `document` \| `other` |
| size | number (bytes) |
| uploadedBy | string |
| uploadedAt | string (ISO) |

### Rotas

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| POST | `/tickets/:ticketId/messages` | Nova mensagem (JSON); anexos via multipart ou upload prévio |
| POST | `/attachments` | Upload `multipart/form-data` → retorna metadados + `url` |
| GET | `/attachments/:id/download` | (opcional) download autenticado |

**POST `/tickets/:ticketId/messages`** — body JSON (sem arquivo):

```json
{
  "content": "Texto da mensagem",
  "mentions": ["Maria Santos"],
  "type": "comment",
  "attachmentIds": ["uuid-anexo-já-enviado"]
}
```

**Response:**

```json
{
  "message": {
    "id": "msg-uuid",
    "author": "João Silva",
    "content": "...",
    "timestamp": "2025-07-15T11:15:00.000Z",
    "mentions": ["Maria Santos"],
    "type": "comment",
    "attachments": []
  }
}
```

**POST `/attachments`** — `multipart/form-data`: campo `file` (+ opcional `ticketId`, `messageId`).  
**Response:**

```json
{
  "attachment": {
    "id": "uuid",
    "name": "error-screenshot.png",
    "url": "https://...",
    "type": "image",
    "size": 245760,
    "uploadedBy": "João Silva",
    "uploadedAt": "2025-07-15T11:15:00.000Z"
  }
}
```

---

## 12. Estoque (movimentações)

Telas: lista `/inventory`, formulário `/inventory/new`. Tipo: `InventoryMovement` em `src/types/inventory.ts`, mock `inventory.json`.

### Modelo

| Campo | Tipo |
| ----- | ---- |
| id | string |
| codigoProduto | string |
| descricao | string |
| quantidade | number |
| tipo | `entrada` \| `saida` |
| data | string (ISO) |
| motivo | string (opcional na UI) |
| responsavel | string (opcional) |
| observacoes | string (opcional) |

### Rotas

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/inventory/movements` | Lista + filtros |
| POST | `/inventory/movements` | Registrar movimentação |

**GET** — query: `codigoProduto`, `descricao`, `tipo`, `dataInicial`, `dataFinal`, `page`, `limit`

**POST** — body:

```json
{
  "productId": "uuid-opcional",
  "codigoProduto": "PROD001",
  "descricao": "Notebook Dell Inspiron 15",
  "quantidade": 50,
  "tipo": "entrada",
  "motivo": "Compra de fornecedor",
  "responsavel": "João Silva",
  "observacoes": "Entrega conforme pedido"
}
```

Backend deve validar estoque em `saida` e atualizar `quantidadeEstoque` do produto transacionalmente.

**Response GET:**

```json
{
  "movements": [],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

## 13. Representantes

Tela: `/sales/representatives`. Mock: `representatives.json` (inclui `regions` e `statusOptions`).

### Modelo

| Campo | Tipo |
| ----- | ---- |
| id | string |
| name | string |
| email | string |
| phone | string |
| avatar | string (iniciais ou URL) |
| region | string |
| status | `active` \| `inactive` \| `vacation` \| `training` |
| totalSales | number |
| monthlyGoal | number |
| clientsCount | number |
| lastActivity | string (ISO) |

### Rotas

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/representatives` | Lista + filtros + `regions` + `statusOptions` |
| GET | `/representatives/:id` | Detalhe |
| POST | `/representatives` | Criar |
| PUT/PATCH | `/representatives/:id` | Atualizar |
| DELETE | `/representatives/:id` | Remover |

**GET** — query: `name`, `region`, `status`, `page`, `limit`

**Response:**

```json
{
  "representatives": [],
  "regions": ["São Paulo - Capital", "..."],
  "statusOptions": [
    { "value": "active", "label": "Ativo" },
    { "value": "inactive", "label": "Inativo" },
    { "value": "vacation", "label": "Férias" },
    { "value": "training", "label": "Treinamento" }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

`statusOptions` podem ser estáticos ou vindos do backend para i18n futura.

---

## 14. Configurações (opcional)

Hoje `settings.json` define seções de UI (ícones, títulos) e `userInfo` de exemplo. O **ThemeCustomizer** é local (palette MUI).

Opcional no backend:

| Método | Rota | Descrição |
| ------ | ---- | --------- |
| GET | `/settings/sections` | Metadados das seções (id, title, description, iconKey) |
| GET | `/users/me/preferences` | Preferências persistidas (tema, idioma, etc.) |
| PATCH | `/users/me/preferences` | Atualizar preferências |

Se não implementado, o frontend continua com JSON estático + estado local.

---

## 15. Docker e operações

- Dockerfile NestJS + `docker-compose` com PostgreSQL (e opcionalmente volume, healthcheck).
- Migrations (TypeORM/Prisma/Knex) para todas as tabelas.
- Seeds opcionais: prioridades, tags, `statusOptions`-equivalente, usuário admin.

---

## 16. Observações finais

- Validar todos os DTOs; erros 400 com `details` por campo.
- Respeitar FKs: pedidos → clientes/produtos; movimentações → produtos; orçamentos → itens; tickets → prioridades/tags; mensagens → tickets.
- **Todos os retornos de sucesso** devem ser objetos JSON coerentes com os exemplos (chaves em camelCase).
- Ao conectar o frontend real: substituir mocks por chamadas HTTP e unificar tipos (`src/types` + camada de API) com este contrato.

### Tabelas sugeridas (referência rápida)

- `users`, `clients`, `products`, `orders`, `order_items`, `budgets`, `budget_items`, `inventory_movements`, `representatives`, `tickets`, `ticket_tags`, `ticket_messages`, `attachments`, `priorities`, `tags`, `purchases` (ou view/agregado sobre pedidos)

Relacionamentos N:N tickets↔tags; anexos ligados a mensagem (e opcionalmente a ticket).

---

_Documento gerado com base na análise do repositório (rotas em `src/app`, tipos em `src/types`, mocks em `src/mocks`, entidades em `src/domain`, NextAuth em `src/infrastructure/auth`)._
