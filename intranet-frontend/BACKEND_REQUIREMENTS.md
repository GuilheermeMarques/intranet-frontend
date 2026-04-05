# Requisitos do Backend para a Intranet Corporativa

Este documento foi refeito a partir da analise do frontend atual em `intranet-frontend/src/app`, `src/types`, `src/mocks`, `src/infrastructure` e `src/presentation`.

O objetivo aqui nao e descrever um backend idealizado, e sim o backend que o frontend atual precisara para funcionar de ponta a ponta, com o menor atrito possivel na integracao.

## 1. Escopo analisado

Rotas ativas do frontend:

- `/login`
- `/home`
- `/catalog`
- `/clients`
- `/clients/[id]`
- `/budgets`
- `/inventory`
- `/inventory/new`
- `/sales/orders`
- `/sales/orders/new`
- `/sales/orders/[id]`
- `/sales/representatives`
- `/tickets`
- `/tickets/priorities`
- `/tickets/tags`
- `/settings`

Arquivos-chave usados como base:

- `src/types/*.ts`
- `src/mocks/*.json`
- `src/infrastructure/auth/authConfig.ts`
- `src/infrastructure/services/api.ts`
- `src/presentation/hooks/useClientsQuery.ts`
- `src/presentation/hooks/useOrdersQuery.ts`

## 2. Conclusoes importantes da analise

### 2.1 Fonte de verdade atual do frontend

Hoje a UI visivel usa majoritariamente:

- `src/types/*`
- `src/mocks/*`
- componentes dentro de `src/app/*`

Existe uma segunda camada em `src/domain/*` e `src/infrastructure/services/api.ts` com contratos parcialmente diferentes. Ela ainda nao representa o comportamento real da UI principal.

### 2.2 Prioridade de compatibilidade

Para a integracao funcionar com o frontend atual, o backend deve priorizar os contratos usados pelas paginas:

- clientes com `codigo`, `nome`, `cidade`, `dataUltimaCompra`, `quantidadeCompras`
- pedidos com `clientCode`, `clientName`, `shippingCost`, `notes`
- tickets com campos em ingles: `title`, `description`, `status`, `priority`, `assignee`, `reporter`, `messages`
- produtos com `codigoProduto`, `nomeProduto`, `descricaoProduto`, `quantidadeEstoque`
- movimentacoes de estoque com `codigoProduto`, `descricao`, `tipo`, `motivo`, `responsavel`

### 2.3 Divergencias atuais do frontend

Essas divergencias precisam ser consideradas no backend ou corrigidas depois no frontend:

- `src/types/ticket.ts` usa `priority` como ID de prioridade (`priority-4`), mas o filtro da pagina `/tickets` ainda usa valores semanticos (`low`, `medium`, `high`, `critical`). Na integracao, o frontend deve mapear isso, ou o backend precisa aceitar alias temporarios.
- `src/domain/entities/Ticket.ts` usa nomes em portugues (`titulo`, `descricao`, `prioridade`), mas a tela ativa usa os nomes em ingles do mock.
- `src/domain/entities/Product.ts` e `src/types/product.ts` sao diferentes.
- `src/domain/entities/Order.ts` usa `clientId`, mas a UI ativa trabalha com `clientCode` e `clientName`.
- a pagina `/login` ainda nao esta ligada ao hook `useAuth`, mas o projeto ja tem NextAuth configurado.

## 3. Convencoes globais da API

### 3.1 Prefixo e formato

- Prefixo sugerido: `/api/v1`
- JSON sempre em `camelCase`
- Datas em ISO 8601
- Valores monetarios como `number`
- IDs internos: UUID
- Codigos de negocio podem coexistir com UUID:
  - `codigo` do cliente
  - `codigoProduto`
  - `number` do orçamento
  - `id` amigavel do pedido, se desejado, como `PED-001`

### 3.2 Autenticacao

Rotas protegidas devem aceitar:

- `Authorization: Bearer <token>`

O backend deve permitir dois cenarios:

1. autenticar diretamente por JWT proprio

### 3.3 Envelope de resposta

Resposta de sucesso:

```json
{
  "data": {},
  "message": "Operacao realizada com sucesso"
}
```

Ou, para reduzir adaptacao no frontend atual, tambem e aceitavel devolver objetos nomeados por recurso:

```json
{
  "client": {},
  "message": "Cliente criado com sucesso"
}
```

### 3.4 Erros

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

### 3.5 Paginacao

Para listagens:

- `page`
- `limit`
- `sortBy`
- `sortOrder`

Resposta:

```json
{
  "items": [],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

Nos modulos abaixo, quando a UI atual espera nomes especificos como `clients`, `products`, `orders`, esses nomes devem ser preservados.

### 3.6 Upload de arquivos

O frontend de chamados precisa de upload de anexos.

Backend deve suportar:

- `multipart/form-data`
- retorno com URL publica ou autenticada
- metadados de arquivo: nome, tipo, tamanho, usuario e data de upload

## 4. Mapa funcional frontend -> backend

| Rota                     | O que a tela faz                                 | O que o backend precisa entregar                                 |
| ------------------------ | ------------------------------------------------ | ---------------------------------------------------------------- |
| `/login`                 | login com email e senha                          | autenticacao, usuario atual, refresh/logout                      |
| `/home`                  | cards, progresso e atividade recente             | agregados de dashboard                                           |
| `/catalog`               | lista produtos com filtros                       | listagem de produtos                                             |
| `/clients`               | listar, filtrar, criar cliente                   | CRUD de clientes + cidades                                       |
| `/clients/[id]`          | ver e editar cliente, ver compras                | detalhe de cliente + historico de compras                        |
| `/budgets`               | listar, filtrar e criar orcamento                | CRUD de orcamentos + clientes + representantes ativos + produtos |
| `/inventory`             | listar movimentacoes                             | listagem de movimentacoes + motivos/tipos                        |
| `/inventory/new`         | criar movimentacao                               | criacao de movimentacao + consulta de produtos                   |
| `/sales/orders`          | listar e filtrar pedidos                         | listagem de pedidos                                              |
| `/sales/orders/new`      | criar pedido                                     | busca de clientes, busca de produtos, criacao de pedido          |
| `/sales/orders/[id]`     | ver pedido, cliente e mudar status               | detalhe de pedido + alteracao de status                          |
| `/sales/representatives` | listar representantes                            | listagem de representantes + filtros                             |
| `/tickets`               | kanban, detalhe, mensagens, anexos, criar ticket | CRUD de tickets, comentarios, anexos, prioridades, tags, lookups |
| `/tickets/priorities`    | CRUD de prioridades                              | CRUD de prioridades                                              |
| `/tickets/tags`          | CRUD de tags                                     | CRUD de tags                                                     |
| `/settings`              | dados da conta e preferencias                    | perfil do usuario e preferencias salvas                          |

## 5. Autenticacao, usuario e preferencias

## 5.1 Necessidades da UI

- login com email e senha
- sessao com `id`, `name`, `email`, `role`
- pagina de configuracoes com dados do usuario
- preferencias opcionais:
  - tema
  - idioma
  - sidebar expandida
  - notificacoes
  - auto save
  - items por pagina
  - esquema de cores

## 5.2 Rotas

| Metodo | Rota              | Uso                                                    |
| ------ | ----------------- | ------------------------------------------------------ |
| POST   | `/auth/login`     | autenticar                                             |
| POST   | `/auth/refresh`   | renovar token                                          |
| POST   | `/auth/logout`    | invalidar sessao                                       |
| GET    | `/auth/me`        | usuario logado                                         |
| GET    | `/me/profile`     | perfil do usuario atual                                |
| PATCH  | `/me/profile`     | editar perfil                                          |
| GET    | `/me/preferences` | carregar preferencias                                  |
| PATCH  | `/me/preferences` | salvar preferencias                                    |
| GET    | `/users/lookup`   | selects de usuarios para tickets, responsaveis e afins |

## 5.3 Contrato minimo

### POST `/auth/login`

Request:

```json
{
  "email": "admin@empresa.com",
  "password": "admin123"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "name": "Administrador",
    "email": "admin@empresa.com",
    "role": "admin"
  },
  "accessToken": "jwt",
  "refreshToken": "jwt",
  "expiresIn": 86400
}
```

### GET `/auth/me`

```json
{
  "user": {
    "id": "uuid",
    "name": "Administrador",
    "email": "admin@empresa.com",
    "role": "admin",
    "lastLoginAt": "2026-04-05T17:00:00Z"
  }
}
```

### GET `/me/preferences`

```json
{
  "preferences": {
    "theme": "light",
    "language": "pt-BR",
    "sidebarExpanded": false,
    "notifications": true,
    "autoSave": true,
    "itemsPerPage": 20,
    "colorScheme": {
      "primary": "#8e24aa",
      "secondary": "#ff6f00"
    }
  }
}
```

## 5.4 Tabelas necessarias

### `users`

| Coluna        | Tipo                 | Observacao                                            |
| ------------- | -------------------- | ----------------------------------------------------- |
| id            | uuid pk              |                                                       |
| name          | varchar(150)         |                                                       |
| email         | varchar(255) unique  |                                                       |
| password_hash | varchar(255)         |                                                       |
| role          | varchar(50)          | `admin`, `user`, `support`, `sales`, `representative` |
| is_active     | boolean              |                                                       |
| avatar_url    | text nullable        |                                                       |
| last_login_at | timestamptz nullable |                                                       |
| created_at    | timestamptz          |                                                       |
| updated_at    | timestamptz          |                                                       |
| deleted_at    | timestamptz nullable | soft delete opcional                                  |

### `refresh_tokens`

| Coluna     | Tipo                 |
| ---------- | -------------------- |
| id         | uuid pk              |
| user_id    | uuid fk `users.id`   |
| token_hash | varchar(255)         |
| expires_at | timestamptz          |
| revoked_at | timestamptz nullable |
| created_at | timestamptz          |

### `user_preferences`

| Coluna           | Tipo                      |
| ---------------- | ------------------------- |
| id               | uuid pk                   |
| user_id          | uuid fk `users.id` unique |
| theme            | varchar(20)               |
| language         | varchar(20)               |
| sidebar_expanded | boolean                   |
| notifications    | boolean                   |
| auto_save        | boolean                   |
| items_per_page   | integer                   |
| color_primary    | varchar(20) nullable      |
| color_secondary  | varchar(20) nullable      |
| created_at       | timestamptz               |
| updated_at       | timestamptz               |

## 6. Dashboard

## 6.1 Necessidade da UI

A pagina `/home` renderiza:

- `stats`
- `progress`
- `recentActivity`

Hoje a UI espera esses blocos prontos para renderizacao.

## 6.2 Rotas

| Metodo | Rota                 |
| ------ | -------------------- |
| GET    | `/dashboard/summary` |

## 6.3 Response esperado

```json
{
  "stats": [
    {
      "title": "Total de Usuarios",
      "value": "1234",
      "icon": "People",
      "color": "primary",
      "trend": "este mes",
      "trendValue": "+12%"
    }
  ],
  "progress": [
    {
      "title": "Produtos no Catalogo",
      "value": 156,
      "total": 200,
      "color": "primary",
      "icon": "Inventory"
    }
  ],
  "recentActivity": [
    {
      "action": "Novo usuario registrado",
      "user": "Joao Silva",
      "time": "2 minutos atras",
      "type": "user"
    }
  ]
}
```

Observacao:

- para evitar logica extra no frontend atual, `icon`, `color`, `type` e `time` podem vir prontos
- alternativamente o backend pode retornar `timestamp`, mas a UI atual teria de ser ajustada

## 7. Clientes

## 7.1 Necessidade da UI

Paginas:

- `/clients`
- `/clients/[id]`

Fluxos:

- listar clientes
- filtrar por codigo, nome, cidade e intervalo de data da ultima compra
- criar cliente
- abrir detalhe por `codigo`
- editar cliente
- ver historico de compras

## 7.2 Modelo que a tela usa

```ts
interface Client {
  codigo: string;
  nome: string;
  cpf: string;
  cep: string;
  endereco: string;
  cidade: string;
  estado: string;
  bairro: string;
  numero: string;
  complemento: string;
  email: string;
  telefone: string;
  instagram: string;
  dataUltimaCompra: string;
  quantidadeCompras: number;
}
```

Para o backend, tambem sao recomendados:

- `id`
- `createdAt`
- `updatedAt`

## 7.3 Rotas

| Metodo | Rota                    | Uso                                 |
| ------ | ----------------------- | ----------------------------------- |
| GET    | `/clients`              | lista e filtros                     |
| GET    | `/clients/:id`          | detalhe por UUID                    |
| GET    | `/clients/code/:codigo` | detalhe por codigo, sem ambiguidade |
| POST   | `/clients`              | criar                               |
| PATCH  | `/clients/:id`          | editar                              |
| DELETE | `/clients/:id`          | excluir ou inativar                 |
| GET    | `/clients/lookups`      | cidades e filtros auxiliares        |

## 7.4 GET `/clients`

Query params:

- `codigo`
- `nome`
- `cidade`
- `dataInicial`
- `dataFinal`
- `page`
- `limit`

Response:

```json
{
  "clients": [
    {
      "id": "uuid",
      "codigo": "CLI001",
      "nome": "Joao Silva",
      "cpf": "123.456.789-00",
      "cep": "01234-567",
      "endereco": "Rua das Flores",
      "cidade": "Sao Paulo",
      "estado": "SP",
      "bairro": "Centro",
      "numero": "123",
      "complemento": "Apto 45",
      "email": "joao@email.com",
      "telefone": "(11) 99999-9999",
      "instagram": "@joao",
      "dataUltimaCompra": "2026-03-20",
      "quantidadeCompras": 12,
      "createdAt": "2026-03-01T10:00:00Z",
      "updatedAt": "2026-03-20T15:00:00Z"
    }
  ],
  "cidades": ["Sao Paulo", "Rio de Janeiro"],
  "total": 15,
  "page": 1,
  "limit": 20
}
```

Importante:

- o frontend atual usa `cidades` na propria resposta da listagem
- manter isso reduz refactor

## 7.5 POST `/clients`

Request:

```json
{
  "nome": "Joao Silva",
  "cpf": "123.456.789-00",
  "cep": "01234-567",
  "endereco": "Rua das Flores",
  "cidade": "Sao Paulo",
  "estado": "SP",
  "bairro": "Centro",
  "numero": "123",
  "complemento": "Apto 45",
  "email": "joao@email.com",
  "telefone": "(11) 99999-9999",
  "instagram": "@joao"
}
```

Response:

```json
{
  "client": {
    "id": "uuid",
    "codigo": "CLI014",
    "nome": "Joao Silva",
    "cpf": "123.456.789-00",
    "cep": "01234-567",
    "endereco": "Rua das Flores",
    "cidade": "Sao Paulo",
    "estado": "SP",
    "bairro": "Centro",
    "numero": "123",
    "complemento": "Apto 45",
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999",
    "instagram": "@joao",
    "dataUltimaCompra": null,
    "quantidadeCompras": 0,
    "createdAt": "2026-04-05T18:00:00Z",
    "updatedAt": "2026-04-05T18:00:00Z"
  },
  "message": "Cliente criado com sucesso"
}
```

## 7.6 PATCH `/clients/:id`

A tela de detalhe edita:

- `nome`
- `cpf`
- `email`
- `telefone`
- `instagram`
- `cep`
- `endereco`
- `numero`
- `bairro`
- `cidade`
- `estado`

## 7.7 Tabela necessaria

### `clients`

| Coluna             | Tipo                  | Observacao               |
| ------------------ | --------------------- | ------------------------ |
| id                 | uuid pk               |                          |
| codigo             | varchar(30) unique    | usado na URL do frontend |
| nome               | varchar(150)          |                          |
| cpf                | varchar(20) unique    |                          |
| cep                | varchar(20)           |                          |
| endereco           | varchar(255)          |                          |
| cidade             | varchar(120)          |                          |
| estado             | varchar(2)            |                          |
| bairro             | varchar(120)          |                          |
| numero             | varchar(30)           |                          |
| complemento        | varchar(120) nullable |                          |
| email              | varchar(255)          |                          |
| telefone           | varchar(30)           |                          |
| instagram          | varchar(100) nullable |                          |
| data_ultima_compra | date nullable         | pode ser derivado        |
| quantidade_compras | integer default 0     | pode ser derivado        |
| created_at         | timestamptz           |                          |
| updated_at         | timestamptz           |                          |
| deleted_at         | timestamptz nullable  |                          |

## 8. Historico de compras do cliente

## 8.1 Necessidade da UI

A aba "Historico de Compras" em `/clients/[id]` mostra:

- numero do pedido
- data
- total
- lista de produtos comprados

## 8.2 Rotas

| Metodo | Rota                              |
| ------ | --------------------------------- |
| GET    | `/clients/code/:codigo/purchases` |

## 8.3 Response esperado

```json
{
  "purchases": [
    {
      "id": "PUR001",
      "clientCode": "CLI001",
      "orderNumber": "PED-001",
      "date": "2026-03-20",
      "total": 1250,
      "products": [
        {
          "name": "Produto A",
          "quantity": 2,
          "unitPrice": 500,
          "total": 1000
        }
      ]
    }
  ],
  "total": 3,
  "page": 1,
  "limit": 20
}
```

Observacao:

- nao e obrigatorio ter tabela `purchases`
- esse retorno pode ser derivado de `orders` + `order_items`

## 9. Produtos e catalogo

## 9.1 Necessidade da UI

Usos:

- `/catalog`
- `/inventory/new`
- `/sales/orders/new`
- `/budgets`

Campos efetivamente usados pela UI atual:

- `id`
- `codigoProduto`
- `nomeProduto`
- `descricaoProduto`
- `preco`
- `quantidadeEstoque`
- `ultimaDataVenda`
- `fornecedor`

## 9.2 Rotas

| Metodo | Rota                |
| ------ | ------------------- |
| GET    | `/products`         |
| GET    | `/products/:id`     |
| POST   | `/products`         |
| PATCH  | `/products/:id`     |
| DELETE | `/products/:id`     |
| GET    | `/products/lookups` |

## 9.3 GET `/products`

Query params:

- `codigoProduto`
- `nomeProduto`
- `fornecedor`
- `page`
- `limit`

Response:

```json
{
  "products": [
    {
      "id": "uuid",
      "codigoProduto": "PROD001",
      "nomeProduto": "Notebook Dell Inspiron",
      "descricaoProduto": "Notebook Dell Inspiron 15 polegadas",
      "preco": 3499.99,
      "quantidadeEstoque": 15,
      "ultimaDataVenda": "2026-03-28",
      "fornecedor": "Dell Brasil"
    }
  ],
  "suppliers": ["Dell Brasil", "Logitech"],
  "total": 120,
  "page": 1,
  "limit": 20
}
```

Notas:

- `/catalog` pode consumir diretamente `GET /products`
- `suppliers` e opcional, mas ajuda se depois a UI evoluir para select

## 9.4 Tabela necessaria

### `products`

| Coluna             | Tipo                 |
| ------------------ | -------------------- |
| id                 | uuid pk              |
| codigo_produto     | varchar(50) unique   |
| nome_produto       | varchar(180)         |
| descricao_produto  | text                 |
| preco              | numeric(12,2)        |
| quantidade_estoque | integer              |
| ultima_data_venda  | date nullable        |
| fornecedor         | varchar(180)         |
| ativo              | boolean default true |
| created_at         | timestamptz          |
| updated_at         | timestamptz          |
| deleted_at         | timestamptz nullable |

## 10. Estoque

## 10.1 Necessidade da UI

Paginas:

- `/inventory`
- `/inventory/new`

Fluxos:

- listar movimentacoes
- filtrar por produto, descricao, tipo e data
- criar movimentacao de entrada ou saida
- listar motivos possiveis
- consultar estoque atual do produto na tela de nova movimentacao

## 10.2 Rotas

| Metodo | Rota                   |
| ------ | ---------------------- |
| GET    | `/inventory/movements` |
| POST   | `/inventory/movements` |
| GET    | `/inventory/lookups`   |

## 10.3 GET `/inventory/movements`

Query params:

- `codigoProduto`
- `descricao`
- `tipo`
- `dataInicial`
- `dataFinal`
- `page`
- `limit`

Response:

```json
{
  "movements": [
    {
      "id": "uuid",
      "codigoProduto": "PROD001",
      "descricao": "Notebook Dell Inspiron 15",
      "quantidade": 5,
      "tipo": "saida",
      "data": "2026-04-05T18:00:00Z",
      "motivo": "Venda",
      "responsavel": "Maria Santos",
      "observacoes": "Pedido corporativo"
    }
  ],
  "tipos": ["entrada", "saida"],
  "motivos": [
    "Compra de fornecedor",
    "Venda",
    "Devolucao",
    "Ajuste de estoque",
    "Transferencia",
    "Perda/Danificacao"
  ],
  "total": 50,
  "page": 1,
  "limit": 20
}
```

## 10.4 POST `/inventory/movements`

Request:

```json
{
  "productId": "uuid",
  "codigoProduto": "PROD001",
  "descricao": "Notebook Dell Inspiron 15",
  "quantidade": 5,
  "tipo": "saida",
  "motivo": "Venda",
  "responsavel": "Maria Santos",
  "observacoes": "Pedido corporativo"
}
```

Regras importantes:

- saida nao pode deixar estoque negativo
- ao criar movimentacao, atualizar `products.quantidade_estoque`
- para saida, registrar snapshot suficiente para auditoria

## 10.5 Tabela necessaria

### `inventory_movements`

| Coluna         | Tipo                  | Observacao                |
| -------------- | --------------------- | ------------------------- |
| id             | uuid pk               |                           |
| product_id     | uuid fk `products.id` |                           |
| codigo_produto | varchar(50)           | snapshot para consulta    |
| descricao      | varchar(255)          | snapshot do produto       |
| quantidade     | integer               |                           |
| tipo           | varchar(20)           | `entrada` ou `saida`      |
| motivo         | varchar(100)          |                           |
| responsavel    | varchar(150)          | nome mostrado na UI atual |
| observacoes    | text nullable         |                           |
| data           | timestamptz           | data exibida na listagem  |
| created_at     | timestamptz           |                           |

## 11. Pedidos

## 11.1 Necessidade da UI

Paginas:

- `/sales/orders`
- `/sales/orders/new`
- `/sales/orders/[id]`

Fluxos:

- listar pedidos
- filtrar por codigo, cliente, status e datas
- criar pedido com cliente + produtos + frete
- exibir dados completos do cliente no detalhe
- alterar status e observacoes do pedido

## 11.2 Modelo que a UI usa

```ts
interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Order {
  id: string;
  clientCode: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  items: OrderItem[];
  total: number;
  shippingCost: number;
  status: 'pending' | 'shipped' | 'delivered' | 'canceled';
  createdAt: string;
  updatedAt?: string;
  notes?: string;
}
```

## 11.3 Rotas

| Metodo | Rota                 | Uso                                  |
| ------ | -------------------- | ------------------------------------ |
| GET    | `/orders`            | listar                               |
| GET    | `/orders/:id`        | detalhe                              |
| POST   | `/orders`            | criar                                |
| PATCH  | `/orders/:id`        | editar observacoes, itens ou cliente |
| PATCH  | `/orders/:id/status` | alterar status                       |
| DELETE | `/orders/:id`        | cancelar ou excluir conforme regra   |

## 11.4 GET `/orders`

Query params:

- `orderCode`
- `clientName`
- `status`
- `startDate`
- `endDate`
- `page`
- `limit`

Response:

```json
{
  "orders": [
    {
      "id": "PED-001",
      "clientCode": "CLI001",
      "clientName": "Joao Silva",
      "clientEmail": "joao@email.com",
      "clientPhone": "(11) 99999-9999",
      "items": [
        {
          "id": "ITEM-001",
          "productId": "uuid-produto",
          "productCode": "PROD001",
          "productName": "Notebook Dell Inspiron",
          "quantity": 2,
          "unitPrice": 150,
          "total": 300
        }
      ],
      "total": 450,
      "shippingCost": 25,
      "status": "pending",
      "createdAt": "2026-04-05T12:00:00Z",
      "updatedAt": "2026-04-05T12:00:00Z",
      "notes": "Entrega urgente"
    }
  ],
  "total": 40,
  "page": 1,
  "limit": 20
}
```

## 11.5 POST `/orders`

Request recomendado:

```json
{
  "clientId": "uuid-cliente",
  "items": [
    {
      "productId": "uuid-produto",
      "quantity": 2,
      "unitPrice": 150
    }
  ],
  "shippingCost": 25,
  "notes": "Entrega urgente"
}
```

Resposta:

```json
{
  "order": {
    "id": "PED-001",
    "clientCode": "CLI001",
    "clientName": "Joao Silva",
    "clientEmail": "joao@email.com",
    "clientPhone": "(11) 99999-9999",
    "items": [
      {
        "id": "ITEM-001",
        "productId": "uuid-produto",
        "productCode": "PROD001",
        "productName": "Notebook Dell Inspiron",
        "quantity": 2,
        "unitPrice": 150,
        "total": 300
      }
    ],
    "total": 450,
    "shippingCost": 25,
    "status": "pending",
    "createdAt": "2026-04-05T12:00:00Z",
    "updatedAt": "2026-04-05T12:00:00Z",
    "notes": "Entrega urgente"
  },
  "message": "Pedido criado com sucesso"
}
```

## 11.6 PATCH `/orders/:id/status`

Request:

```json
{
  "status": "shipped",
  "notes": "Pedido despachado"
}
```

## 11.7 Tabelas necessarias

### `orders`

| Coluna        | Tipo                  | Observacao                                    |
| ------------- | --------------------- | --------------------------------------------- |
| id            | uuid pk               | ID interno                                    |
| order_code    | varchar(50) unique    | pode ser exposto como `id` na UI              |
| client_id     | uuid fk `clients.id`  |                                               |
| client_code   | varchar(30)           | snapshot                                      |
| client_name   | varchar(150)          | snapshot                                      |
| client_email  | varchar(255) nullable | snapshot                                      |
| client_phone  | varchar(30) nullable  | snapshot                                      |
| subtotal      | numeric(12,2)         | soma dos itens                                |
| shipping_cost | numeric(12,2)         |                                               |
| total         | numeric(12,2)         | subtotal + frete                              |
| status        | varchar(20)           | `pending`, `shipped`, `delivered`, `canceled` |
| notes         | text nullable         |                                               |
| created_at    | timestamptz           |                                               |
| updated_at    | timestamptz           |                                               |
| shipped_at    | timestamptz nullable  |                                               |
| delivered_at  | timestamptz nullable  |                                               |
| canceled_at   | timestamptz nullable  |                                               |

### `order_items`

| Coluna       | Tipo                  |
| ------------ | --------------------- |
| id           | uuid pk               |
| order_id     | uuid fk `orders.id`   |
| product_id   | uuid fk `products.id` |
| product_code | varchar(50)           |
| product_name | varchar(180)          |
| quantity     | integer               |
| unit_price   | numeric(12,2)         |
| total        | numeric(12,2)         |
| created_at   | timestamptz           |

## 12. Orcamentos

## 12.1 Necessidade da UI

Pagina:

- `/budgets`

Fluxos:

- listar orcamentos
- filtrar por numero, cliente, responsavel, status e periodo
- criar orcamento
- selecionar cliente, representante e produtos
- informar `validityDate`

Observacao importante:

- o mock de listagem nao possui `validityDate`
- o formulario de criacao possui `validityDate`
- o backend deve persistir e devolver esse campo

## 12.2 Modelo esperado

```ts
interface Budget {
  id: string;
  number: string;
  client: string;
  responsible: string;
  createdAt: string;
  validityDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  total: number;
  items: BudgetItem[];
}
```

## 12.3 Rotas

| Metodo | Rota           |
| ------ | -------------- |
| GET    | `/budgets`     |
| GET    | `/budgets/:id` |
| POST   | `/budgets`     |
| PATCH  | `/budgets/:id` |
| DELETE | `/budgets/:id` |

## 12.4 GET `/budgets`

Query params:

- `budgetNumber`
- `client`
- `responsible`
- `status`
- `startDate`
- `endDate`
- `page`
- `limit`

Response:

```json
{
  "budgets": [
    {
      "id": "uuid",
      "number": "ORC-2026-001",
      "client": "Empresa ABC Ltda",
      "responsible": "Joao Silva",
      "createdAt": "2026-04-05",
      "validityDate": "2026-05-05",
      "status": "pending",
      "total": 15000,
      "items": [
        {
          "id": "uuid-item",
          "productId": "uuid-produto",
          "product": "Notebook Dell Inspiron",
          "quantity": 5,
          "unitPrice": 3000,
          "total": 15000
        }
      ]
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 20
}
```

## 12.5 POST `/budgets`

Request recomendado:

```json
{
  "clientId": "uuid-cliente",
  "responsibleId": "uuid-representante",
  "validityDate": "2026-05-05",
  "items": [
    {
      "productId": "uuid-produto",
      "quantity": 5,
      "unitPrice": 3000
    }
  ]
}
```

Para transicao com a UI atual, o backend pode aceitar temporariamente:

```json
{
  "client": "Empresa ABC Ltda",
  "responsible": "Joao Silva",
  "validityDate": "2026-05-05",
  "items": [
    {
      "productId": "uuid-produto",
      "product": "Notebook Dell Inspiron",
      "quantity": 5,
      "unitPrice": 3000
    }
  ]
}
```

## 12.6 Tabelas necessarias

### `budgets`

| Coluna           | Tipo                                  |
| ---------------- | ------------------------------------- |
| id               | uuid pk                               |
| budget_number    | varchar(50) unique                    |
| client_id        | uuid fk `clients.id`                  |
| responsible_id   | uuid fk `representatives.id` nullable |
| client_name      | varchar(180)                          |
| responsible_name | varchar(150)                          |
| created_at       | date                                  |
| validity_date    | date                                  |
| status           | varchar(20)                           |
| total            | numeric(12,2)                         |
| notes            | text nullable                         |
| updated_at       | timestamptz                           |

### `budget_items`

| Coluna       | Tipo                           |
| ------------ | ------------------------------ |
| id           | uuid pk                        |
| budget_id    | uuid fk `budgets.id`           |
| product_id   | uuid fk `products.id` nullable |
| product_name | varchar(180)                   |
| quantity     | integer                        |
| unit_price   | numeric(12,2)                  |
| total        | numeric(12,2)                  |

## 13. Representantes

## 13.1 Necessidade da UI

Pagina:

- `/sales/representatives`

Fluxos:

- listar representantes
- filtrar por nome, regiao e status
- exibir vendas, meta, quantidade de clientes e ultima atividade
- o botao "Novo Representante" existe, mesmo sem modal implementado
- a pagina de orcamentos precisa consultar representantes ativos

## 13.2 Rotas

| Metodo | Rota                       |
| ------ | -------------------------- |
| GET    | `/representatives`         |
| GET    | `/representatives/:id`     |
| POST   | `/representatives`         |
| PATCH  | `/representatives/:id`     |
| DELETE | `/representatives/:id`     |
| GET    | `/representatives/lookups` |

## 13.3 GET `/representatives`

Query params:

- `name`
- `region`
- `status`
- `page`
- `limit`

Response:

```json
{
  "representatives": [
    {
      "id": "uuid",
      "name": "Joao Silva",
      "email": "joao.silva@empresa.com",
      "phone": "(11) 99999-1111",
      "region": "Sao Paulo - Capital",
      "status": "active",
      "totalSales": 125000,
      "monthlyGoal": 100000,
      "clientsCount": 45,
      "lastActivity": "2026-04-05T18:00:00Z",
      "avatar": "JS"
    }
  ],
  "regions": ["Sao Paulo - Capital", "Rio de Janeiro"],
  "statusOptions": [
    { "value": "active", "label": "Ativo" },
    { "value": "inactive", "label": "Inativo" },
    { "value": "vacation", "label": "Ferias" },
    { "value": "training", "label": "Treinamento" }
  ],
  "total": 5,
  "page": 1,
  "limit": 20
}
```

## 13.4 Tabela necessaria

### `representatives`

| Coluna        | Tipo                        |
| ------------- | --------------------------- |
| id            | uuid pk                     |
| user_id       | uuid fk `users.id` nullable |
| name          | varchar(150)                |
| email         | varchar(255)                |
| phone         | varchar(30)                 |
| region        | varchar(120)                |
| status        | varchar(20)                 |
| total_sales   | numeric(14,2)               |
| monthly_goal  | numeric(14,2)               |
| clients_count | integer                     |
| last_activity | timestamptz nullable        |
| avatar        | varchar(10) nullable        |
| created_at    | timestamptz                 |
| updated_at    | timestamptz                 |

## 14. Tickets

## 14.1 Necessidade da UI

Paginas:

- `/tickets`
- `/tickets/priorities`
- `/tickets/tags`

Fluxos da tela principal:

- listar tickets em kanban por status
- filtrar por busca, prioridade, categoria, responsavel e datas
- abrir detalhe do ticket
- mudar status no kanban e no modal
- criar ticket
- adicionar comentarios
- anexar arquivos
- destacar mencoes
- manter prioridade por ID e tags por ID

## 14.2 Modelo real esperado pela UI

```ts
interface Ticket {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'inProgress' | 'inReview' | 'done';
  priority: string;
  assignee: string;
  reporter: string;
  createdAt: string;
  updatedAt: string;
  category: string;
  tags: string[];
  messages: Message[];
}
```

```ts
interface Message {
  id: string;
  author: string;
  content: string;
  timestamp: string;
  mentions: string[];
  type: 'comment' | 'status_update' | 'assignment';
  attachments?: Attachment[];
}
```

```ts
interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'other';
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}
```

## 14.3 Rotas

| Metodo | Rota                    | Uso                                                 |
| ------ | ----------------------- | --------------------------------------------------- |
| GET    | `/tickets`              | lista/kanban                                        |
| GET    | `/tickets/:id`          | detalhe completo                                    |
| POST   | `/tickets`              | criar ticket                                        |
| PATCH  | `/tickets/:id`          | editar ticket                                       |
| PATCH  | `/tickets/:id/status`   | mover entre colunas                                 |
| POST   | `/tickets/:id/messages` | comentar no ticket                                  |
| POST   | `/uploads`              | upload de anexos                                    |
| GET    | `/tickets/lookups`      | categorias, status, responsaveis, prioridades, tags |

## 14.4 GET `/tickets`

Query params:

- `search`
- `priority`
- `category`
- `assignee`
- `dataInicial`
- `dataFinal`
- `page`
- `limit`

Response sugerido:

```json
{
  "tickets": [
    {
      "id": "1",
      "title": "Erro no login do sistema",
      "description": "Usuarios nao conseguem fazer login",
      "status": "todo",
      "priority": "priority-4",
      "assignee": "Joao Silva",
      "reporter": "Maria Santos",
      "createdAt": "2026-04-01T10:00:00Z",
      "updatedAt": "2026-04-05T14:20:00Z",
      "category": "Sistema",
      "tags": ["tag-4", "tag-10"],
      "messages": []
    }
  ],
  "statusConfig": {
    "todo": { "label": "ToDo", "color": "#ff9800" },
    "inProgress": { "label": "InProgress", "color": "#2196f3" },
    "inReview": { "label": "In Review", "color": "#9c27b0" },
    "done": { "label": "Done", "color": "#4caf50" }
  },
  "total": 20,
  "page": 1,
  "limit": 100
}
```

Observacao:

- para desempenho, o backend pode devolver `messages: []` na listagem
- o detalhe completo deve vir em `GET /tickets/:id`

## 14.5 POST `/tickets`

Request recomendado:

```json
{
  "title": "Erro no login do sistema",
  "description": "Usuarios nao conseguem fazer login",
  "priorityId": "priority-4",
  "category": "Sistema",
  "assigneeId": "uuid-usuario",
  "tagIds": ["tag-4", "tag-10"],
  "attachments": [
    {
      "fileId": "uuid-upload"
    }
  ]
}
```

Response:

```json
{
  "ticket": {
    "id": "uuid",
    "title": "Erro no login do sistema",
    "description": "Usuarios nao conseguem fazer login",
    "status": "todo",
    "priority": "priority-4",
    "assignee": "Joao Silva",
    "reporter": "Maria Santos",
    "createdAt": "2026-04-05T18:00:00Z",
    "updatedAt": "2026-04-05T18:00:00Z",
    "category": "Sistema",
    "tags": ["tag-4", "tag-10"],
    "messages": [
      {
        "id": "uuid-msg",
        "author": "Maria Santos",
        "content": "Usuarios nao conseguem fazer login",
        "timestamp": "2026-04-05T18:00:00Z",
        "mentions": [],
        "type": "comment",
        "attachments": []
      }
    ]
  }
}
```

## 14.6 PATCH `/tickets/:id/status`

Request:

```json
{
  "status": "inProgress"
}
```

## 14.7 POST `/tickets/:id/messages`

Request:

```json
{
  "content": "Vou investigar o problema. @Maria",
  "mentions": ["Maria"],
  "type": "comment",
  "attachments": [
    {
      "fileId": "uuid-upload"
    }
  ]
}
```

Response:

```json
{
  "message": {
    "id": "uuid-msg",
    "author": "Joao Silva",
    "content": "Vou investigar o problema. @Maria",
    "timestamp": "2026-04-05T18:10:00Z",
    "mentions": ["Maria"],
    "type": "comment",
    "attachments": [
      {
        "id": "uuid-att",
        "name": "error-log.txt",
        "url": "https://cdn.exemplo.com/error-log.txt",
        "type": "document",
        "size": 15360,
        "uploadedBy": "Joao Silva",
        "uploadedAt": "2026-04-05T18:10:00Z"
      }
    ]
  }
}
```

## 14.8 Tabelas necessarias

### `ticket_priorities`

| Coluna      | Tipo           |
| ----------- | -------------- |
| id          | varchar(50) pk |
| name        | varchar(100)   |
| color       | varchar(20)    |
| level       | integer        |
| description | text nullable  |
| is_active   | boolean        |
| created_at  | timestamptz    |
| updated_at  | timestamptz    |

### `ticket_tags`

| Coluna      | Tipo                  |
| ----------- | --------------------- |
| id          | varchar(50) pk        |
| name        | varchar(100)          |
| color       | varchar(20)           |
| description | text nullable         |
| category    | varchar(100) nullable |
| is_active   | boolean               |
| created_at  | timestamptz           |
| updated_at  | timestamptz           |

### `tickets`

| Coluna           | Tipo                                  | Observacao                               |
| ---------------- | ------------------------------------- | ---------------------------------------- |
| id               | uuid pk                               |                                          |
| title            | varchar(180)                          |                                          |
| description      | text                                  |                                          |
| status           | varchar(20)                           | `todo`, `inProgress`, `inReview`, `done` |
| priority_id      | varchar(50) fk `ticket_priorities.id` |                                          |
| assignee_user_id | uuid fk `users.id` nullable           |                                          |
| reporter_user_id | uuid fk `users.id` nullable           |                                          |
| assignee_name    | varchar(150)                          | snapshot para UI                         |
| reporter_name    | varchar(150)                          | snapshot para UI                         |
| category         | varchar(120)                          |                                          |
| sort_order       | integer nullable                      | persistencia do kanban, opcional         |
| created_at       | timestamptz                           |                                          |
| updated_at       | timestamptz                           |                                          |
| closed_at        | timestamptz nullable                  |                                          |

### `ticket_tag_links`

| Coluna    | Tipo                            |
| --------- | ------------------------------- |
| ticket_id | uuid fk `tickets.id`            |
| tag_id    | varchar(50) fk `ticket_tags.id` |

### `ticket_messages`

| Coluna         | Tipo                        |
| -------------- | --------------------------- |
| id             | uuid pk                     |
| ticket_id      | uuid fk `tickets.id`        |
| author_user_id | uuid fk `users.id` nullable |
| author_name    | varchar(150)                |
| content        | text                        |
| mentions       | jsonb                       |
| type           | varchar(30)                 |
| created_at     | timestamptz                 |

### `ticket_attachments`

| Coluna              | Tipo                         |
| ------------------- | ---------------------------- |
| id                  | uuid pk                      |
| ticket_message_id   | uuid fk `ticket_messages.id` |
| name                | varchar(255)                 |
| url                 | text                         |
| type                | varchar(20)                  |
| size                | bigint                       |
| uploaded_by_user_id | uuid fk `users.id` nullable  |
| uploaded_by         | varchar(150)                 |
| uploaded_at         | timestamptz                  |

## 15. Prioridades de chamados

## 15.1 Necessidade da UI

Pagina:

- `/tickets/priorities`

Fluxos:

- listar prioridades
- criar
- editar
- ativar/inativar
- excluir

## 15.2 Rotas

| Metodo | Rota                                    |
| ------ | --------------------------------------- |
| GET    | `/tickets/priorities`                   |
| POST   | `/tickets/priorities`                   |
| PATCH  | `/tickets/priorities/:id`               |
| PATCH  | `/tickets/priorities/:id/toggle-active` |
| DELETE | `/tickets/priorities/:id`               |

## 15.3 Modelo

```json
{
  "id": "priority-4",
  "name": "Alta",
  "color": "#f44336",
  "level": 4,
  "description": "Chamados urgentes",
  "isActive": true
}
```

## 16. Tags de chamados

## 16.1 Necessidade da UI

Pagina:

- `/tickets/tags`

Fluxos:

- listar tags
- criar
- editar
- ativar/inativar
- excluir

## 16.2 Rotas

| Metodo | Rota                              |
| ------ | --------------------------------- |
| GET    | `/tickets/tags`                   |
| POST   | `/tickets/tags`                   |
| PATCH  | `/tickets/tags/:id`               |
| PATCH  | `/tickets/tags/:id/toggle-active` |
| DELETE | `/tickets/tags/:id`               |

## 16.3 Modelo

```json
{
  "id": "tag-1",
  "name": "Bug",
  "color": "#f44336",
  "description": "Problemas no sistema",
  "isActive": true,
  "category": "Tipo"
}
```

## 17. Configuracoes e perfil

## 17.1 Necessidade da UI

Pagina:

- `/settings`

A tela atual precisa de:

- nome do usuario
- email do usuario
- ultimo login

Persistencia de tema e preferencias e desejavel, mas nao bloqueia a UI atual porque hoje isso esta em storage local.

## 17.2 Rotas

| Metodo | Rota              |
| ------ | ----------------- |
| GET    | `/me/profile`     |
| PATCH  | `/me/profile`     |
| GET    | `/me/preferences` |
| PATCH  | `/me/preferences` |

## 17.3 Response minimo

```json
{
  "userInfo": {
    "name": "Usuario Exemplo",
    "email": "usuario@exemplo.com",
    "lastLogin": "2026-04-05T14:30:00Z"
  }
}
```

Observacao:

- a UI atual mostra `lastLogin` como string pronta
- idealmente o backend envia `lastLoginAt` ISO e a UI formata

## 18. Lookups auxiliares

Para reduzir chamadas e simplificar a montagem das telas, o backend pode expor alguns lookups dedicados:

| Metodo | Rota                       | Uso                                                       |
| ------ | -------------------------- | --------------------------------------------------------- |
| GET    | `/clients/lookups`         | cidades                                                   |
| GET    | `/products/lookups`        | fornecedores, categorias futuras                          |
| GET    | `/inventory/lookups`       | tipos e motivos                                           |
| GET    | `/representatives/lookups` | regioes, status, lista de ativos                          |
| GET    | `/tickets/lookups`         | prioridades, tags, categorias, responsaveis, statusConfig |

## 19. Indices recomendados

Para a UX atual, estes indices sao os mais importantes:

- `clients(codigo)`
- `clients(nome)`
- `clients(cidade)`
- `clients(data_ultima_compra)`
- `products(codigo_produto)`
- `products(nome_produto)`
- `products(fornecedor)`
- `inventory_movements(product_id, data)`
- `inventory_movements(tipo, data)`
- `orders(order_code)`
- `orders(client_id, created_at)`
- `orders(status, created_at)`
- `budgets(budget_number)`
- `budgets(status, created_at)`
- `tickets(status, updated_at)`
- `tickets(priority_id, status)`
- `tickets(assignee_user_id, status)`
- `ticket_messages(ticket_id, created_at)`

Se for PostgreSQL, vale considerar trigram/full text para:

- `clients.nome`
- `products.nome_produto`
- `tickets.title`
- `tickets.description`

## 20. Requisitos minimos para o frontend funcionar sem quebrar

Se a entrega for fatiada, esta e a ordem mais segura:

1. autenticacao e usuario atual
2. clientes + compras
3. produtos
4. pedidos
5. estoque
6. orcamentos
7. representantes
8. tickets, prioridades, tags e anexos
9. preferencias de usuario
10. dashboard agregado

## 21. Gaps que o backend deve conhecer antes da integracao

- o frontend ainda tem mocks em praticamente todas as paginas
- a tela de login ainda nao chama `useAuth`, apesar de o projeto ter NextAuth configurado
- ha contratos duplicados entre `src/types` e `src/domain`
- a pagina de tickets mistura IDs de prioridade/tag com filtros semanticos antigos
- a pagina de orcamentos ainda trabalha com `client` e `responsible` por nome, nao por ID
- a pagina de novo pedido ainda nao envia o payload real; so monta o estado local
- a pagina de representantes ainda nao implementa criacao/edicao

## 22. Recomendacao final de implementacao

Para este monolito funcionar bem, a modelagem mais pragmatica e:

- `users`
- `user_preferences`
- `clients`
- `products`
- `inventory_movements`
- `representatives`
- `budgets`
- `budget_items`
- `orders`
- `order_items`
- `ticket_priorities`
- `ticket_tags`
- `tickets`
- `ticket_tag_links`
- `ticket_messages`
- `ticket_attachments`
- `refresh_tokens`

Nao ha necessidade obrigatoria de tabela separada para:

- `dashboard`
- `purchases`
- `settingsSections`
- `statusConfig`

Esses blocos podem ser derivados ou definidos em configuracao de aplicacao.

## 23. Resumo executivo

O frontend atual depende de 8 dominios reais de backend:

- autenticacao/usuario
- dashboard
- clientes
- produtos
- estoque
- pedidos
- orcamentos
- chamados

O contrato mais sensivel e o de chamados, porque envolve:

- kanban
- comentarios
- anexos
- prioridades
- tags
- status por coluna

O segundo ponto mais sensivel e a consistencia entre clientes, produtos, pedidos e orcamentos, porque esses modulos se referenciam entre si.

Se o backend respeitar os contratos deste documento, o frontend atual podera ser migrado dos mocks para API real com baixo risco e sem redesenhar a estrutura principal das paginas.
