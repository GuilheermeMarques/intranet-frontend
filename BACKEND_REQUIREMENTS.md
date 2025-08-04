# Requisitos do Backend para Intranet Corporativa

Este documento detalha tudo que o backend deverá conter para atender ao frontend deste projeto. O backend será desenvolvido em **NestJS** e utilizará **PostgreSQL** (com Docker para subir o banco). Abaixo estão as entidades, rotas, payloads, exemplos e sugestões de tabelas.

---

## Requisitos Gerais

- **Framework:** NestJS
- **Banco de Dados:** PostgreSQL (com Docker)
- **Autenticação:** JWT (sugestão)
- **Upload de arquivos:** Suporte a anexos em chamados
- **Paginação e filtros** em todas as rotas de listagem
- **Validação** de payloads (DTOs)
- **Relacionamentos** entre entidades
- **Padrão de Response:** Todos os retornos devem vir dentro de um objeto `{}`

---

## 1. Clientes

### Tabela: `clients`

| Campo              | Tipo      | Descrição             |
| ------------------ | --------- | --------------------- |
| id (PK)            | UUID      | Identificador         |
| codigo             | VARCHAR   | Código do cliente     |
| nome               | VARCHAR   | Nome completo         |
| cpf                | VARCHAR   | CPF                   |
| cep                | VARCHAR   | CEP                   |
| endereco           | VARCHAR   | Endereço              |
| cidade             | VARCHAR   | Cidade                |
| estado             | VARCHAR   | Estado                |
| bairro             | VARCHAR   | Bairro                |
| numero             | VARCHAR   | Número                |
| complemento        | VARCHAR   | Complemento           |
| email              | VARCHAR   | Email                 |
| telefone           | VARCHAR   | Telefone              |
| instagram          | VARCHAR   | Instagram             |
| data_ultima_compra | DATE      | Data da última compra |
| quantidade_compras | INTEGER   | Quantidade de compras |
| created_at         | TIMESTAMP | Data de criação       |
| updated_at         | TIMESTAMP | Última atualização    |

### Rotas

- `GET /clients` (listar, com filtros)
- `GET /clients/:id` (detalhes)
- `POST /clients` (criar)
- `PUT /clients/:id` (editar)
- `DELETE /clients/:id` (remover)

#### Filtros possíveis em `GET /clients`

- `codigo` (string, busca parcial)
- `nome` (string, busca parcial)
- `cidade` (string, exato)
- `dataInicial` (date, data mínima da última compra)
- `dataFinal` (date, data máxima da última compra)

#### Response `GET /clients`

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
      "email": "joao@email.com",
      "telefone": "(11) 99999-9999",
      "instagram": "@joao_silva",
      "dataUltimaCompra": "2024-01-15",
      "quantidadeCompras": 12,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-15T00:00:00Z"
    }
  ],
  "cidades": ["São Paulo", "Rio de Janeiro", "Belo Horizonte"],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

#### Response `GET /clients/:id`

```json
{
  "client": {
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
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999",
    "instagram": "@joao_silva",
    "dataUltimaCompra": "2024-01-15",
    "quantidadeCompras": 12,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
}
```

### Exemplo de Request/Response

**POST /clients**

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

**Response POST /clients**

```json
{
  "client": {
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
    "email": "joao@email.com",
    "telefone": "(11) 99999-9999",
    "instagram": "@joao_silva",
    "dataUltimaCompra": null,
    "quantidadeCompras": 0,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Cliente criado com sucesso"
}
```

---

## 2. Pedidos (Orders)

### Tabela: `orders`

| Campo          | Tipo      | Descrição                          |
| -------------- | --------- | ---------------------------------- |
| id (PK)        | UUID      | Identificador                      |
| client_id (FK) | UUID      | Cliente                            |
| total          | NUMERIC   | Valor total                        |
| shipping_cost  | NUMERIC   | Frete                              |
| status         | VARCHAR   | pending/shipped/delivered/canceled |
| created_at     | TIMESTAMP | Data do pedido                     |
| updated_at     | TIMESTAMP | Última atualização                 |
| notes          | TEXT      | Observações                        |

### Tabela: `order_items`

| Campo           | Tipo    | Descrição       |
| --------------- | ------- | --------------- |
| id (PK)         | UUID    | Identificador   |
| order_id (FK)   | UUID    | Pedido          |
| product_id (FK) | UUID    | Produto         |
| product_name    | VARCHAR | Nome do produto |
| quantity        | INTEGER | Quantidade      |
| unit_price      | NUMERIC | Preço unitário  |
| total           | NUMERIC | Total do item   |

### Rotas

- `GET /orders` (listar, filtros por cliente, status, data)
- `GET /orders/:id` (detalhes)
- `POST /orders` (criar)
- `PUT /orders/:id` (editar)
- `DELETE /orders/:id` (remover)

#### Filtros possíveis em `GET /orders`

- `orderCode` (string, busca parcial no id)
- `clientName` (string, busca parcial)
- `status` (pending, shipped, delivered, canceled)
- `startDate` (date, data mínima de criação)
- `endDate` (date, data máxima de criação)

#### Response `GET /orders`

```json
{
  "orders": [
    {
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
      "createdAt": "2025-07-20T10:00:00Z",
      "updatedAt": "2025-07-20T10:00:00Z",
      "notes": "Pedido com entrega urgente"
    }
  ],
  "total": 4,
  "page": 1,
  "limit": 10
}
```

#### Response `GET /orders/:id`

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
    "createdAt": "2025-07-20T10:00:00Z",
    "updatedAt": "2025-07-20T10:00:00Z",
    "notes": "Pedido com entrega urgente"
  }
}
```

### Exemplo de Request/Response

**POST /orders**

```json
{
  "clientId": "uuid-do-cliente",
  "items": [{ "productId": "uuid-produto", "quantity": 2, "unitPrice": 150 }],
  "shippingCost": 25,
  "notes": "Pedido urgente"
}
```

**Response POST /orders**

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
    "createdAt": "2025-07-20T10:00:00Z",
    "updatedAt": "2025-07-20T10:00:00Z",
    "notes": "Pedido urgente"
  },
  "message": "Pedido criado com sucesso"
}
```

---

## 3. Orçamentos (Budgets)

### Tabela: `budgets`

| Campo          | Tipo    | Descrição                         |
| -------------- | ------- | --------------------------------- |
| id (PK)        | UUID    | Identificador                     |
| number         | VARCHAR | Número do orçamento               |
| client_id (FK) | UUID    | Cliente                           |
| responsible    | VARCHAR | Responsável                       |
| created_at     | DATE    | Data de criação                   |
| validity_date  | DATE    | Data de validade                  |
| status         | VARCHAR | pending/approved/rejected/expired |
| total          | NUMERIC | Valor total                       |

### Tabela: `budget_items`

| Campo           | Tipo    | Descrição       |
| --------------- | ------- | --------------- |
| id (PK)         | UUID    | Identificador   |
| budget_id (FK)  | UUID    | Orçamento       |
| product_id (FK) | UUID    | Produto         |
| product_name    | VARCHAR | Nome do produto |
| quantity        | INTEGER | Quantidade      |
| unit_price      | NUMERIC | Preço unitário  |
| total           | NUMERIC | Total do item   |

### Rotas

- `GET /budgets` (listar, filtros por cliente, responsável, status, data)
- `GET /budgets/:id` (detalhes)
- `POST /budgets` (criar)
- `PUT /budgets/:id` (editar)
- `DELETE /budgets/:id` (remover)

#### Filtros possíveis em `GET /budgets`

- `budgetNumber` (string, busca parcial)
- `client` (string, exato)
- `responsible` (string, exato)
- `status` (pending, approved, rejected, expired)
- `startDate` (date, data mínima de criação)
- `endDate` (date, data máxima de criação)

#### Response `GET /budgets`

```json
{
  "budgets": [
    {
      "id": "uuid",
      "number": "ORC-2025-001",
      "client": "João Silva",
      "responsible": "Ana Costa",
      "createdAt": "2025-01-15",
      "validityDate": "2025-02-15",
      "status": "pending",
      "total": 1500.0,
      "items": [
        {
          "id": "uuid",
          "product": "Produto A",
          "quantity": 2,
          "unitPrice": 750.0,
          "total": 1500.0
        }
      ]
    }
  ],
  "total": 10,
  "page": 1,
  "limit": 10
}
```

#### Response `GET /budgets/:id`

```json
{
  "budget": {
    "id": "uuid",
    "number": "ORC-2025-001",
    "client": "João Silva",
    "responsible": "Ana Costa",
    "createdAt": "2025-01-15",
    "validityDate": "2025-02-15",
    "status": "pending",
    "total": 1500.0,
    "items": [
      {
        "id": "uuid",
        "product": "Produto A",
        "quantity": 2,
        "unitPrice": 750.0,
        "total": 1500.0
      }
    ]
  }
}
```

---

## 4. Chamados (Tickets)

### Tabela: `tickets`

| Campo            | Tipo      | Descrição                     |
| ---------------- | --------- | ----------------------------- |
| id (PK)          | UUID      | Identificador                 |
| title            | VARCHAR   | Título                        |
| description      | TEXT      | Descrição                     |
| status           | VARCHAR   | todo/inProgress/inReview/done |
| priority_id (FK) | UUID      | Prioridade                    |
| assignee         | VARCHAR   | Responsável                   |
| reporter         | VARCHAR   | Solicitante                   |
| created_at       | TIMESTAMP | Data de criação               |
| updated_at       | TIMESTAMP | Última atualização            |
| category         | VARCHAR   | Categoria                     |

### Tabela: `ticket_tags` (N:N)

| ticket_id (FK)| UUID | Chamado |
| tag_id (FK) | UUID | Tag |

### Tabela: `ticket_messages`

| id (PK) | UUID | Identificador |
| ticket_id (FK)| UUID | Chamado |
| author | VARCHAR | Autor |
| content | TEXT | Conteúdo |
| timestamp | TIMESTAMP | Data/hora |
| type | VARCHAR | comment/status_update/assignment |

### Tabela: `attachments`

| id (PK) | UUID | Identificador |
| message_id (FK)| UUID | Mensagem |
| name | VARCHAR | Nome do arquivo |
| url | VARCHAR | URL |
| type | VARCHAR | image/document/other |
| size | INTEGER | Tamanho (bytes) |
| uploaded_by | VARCHAR | Quem enviou |
| uploaded_at | TIMESTAMP | Data de envio |

### Tabela: `priorities`

| id (PK) | UUID | Identificador |
| name | VARCHAR | Nome |
| color | VARCHAR | Cor |
| level | INTEGER | Nível (1-5) |
| description | VARCHAR | Descrição |
| is_active | BOOLEAN | Ativo |

### Tabela: `tags`

| id (PK) | UUID | Identificador |
| name | VARCHAR | Nome |
| color | VARCHAR | Cor |
| description | VARCHAR | Descrição |
| is_active | BOOLEAN | Ativo |
| category | VARCHAR | Categoria |

### Rotas

- `GET /tickets` (listar, filtros por prioridade, categoria, responsável, data)
- `GET /tickets/:id` (detalhes)
- `POST /tickets` (criar)
- `PUT /tickets/:id` (editar)
- `DELETE /tickets/:id` (remover)
- `POST /tickets/:id/messages` (nova mensagem)
- `POST /attachments` (upload de arquivos)

#### Filtros possíveis em `GET /tickets`

- `search` (string, busca no título e descrição)
- `priority` (id da prioridade)
- `category` (string, exato)
- `assignee` (string, exato)
- `dataInicial` (date, data mínima de criação)
- `dataFinal` (date, data máxima de criação)

#### Response `GET /tickets`

```json
{
  "tickets": [
    {
      "id": "1",
      "title": "Erro no login do sistema",
      "description": "Usuários não conseguem fazer login com credenciais válidas.",
      "status": "todo",
      "priority": "priority-4",
      "assignee": "João Silva",
      "reporter": "Maria Santos",
      "createdAt": "2025-07-15T10:30:00Z",
      "updatedAt": "2025-07-15T14:20:00Z",
      "category": "Sistema",
      "tags": ["tag-4", "tag-1", "tag-10"],
      "messages": [
        {
          "id": "1",
          "author": "Maria Santos",
          "content": "Usuários estão relatando que não conseguem fazer login.",
          "timestamp": "2025-07-15T10:30:00Z",
          "mentions": [],
          "type": "comment"
        }
      ]
    }
  ],
  "statusConfig": {
    "todo": { "label": "ToDo", "color": "#ff9800" },
    "inProgress": { "label": "InProgress", "color": "#2196f3" },
    "inReview": { "label": "In Review", "color": "#9c27b0" },
    "done": { "label": "Done", "color": "#4caf50" }
  },
  "total": 5,
  "page": 1,
  "limit": 10
}
```

#### Response `GET /tickets/:id`

```json
{
  "ticket": {
    "id": "1",
    "title": "Erro no login do sistema",
    "description": "Usuários não conseguem fazer login com credenciais válidas.",
    "status": "todo",
    "priority": "priority-4",
    "assignee": "João Silva",
    "reporter": "Maria Santos",
    "createdAt": "2025-07-15T10:30:00Z",
    "updatedAt": "2025-07-15T14:20:00Z",
    "category": "Sistema",
    "tags": ["tag-4", "tag-1", "tag-10"],
    "messages": [
      {
        "id": "1",
        "author": "Maria Santos",
        "content": "Usuários estão relatando que não conseguem fazer login.",
        "timestamp": "2025-07-15T10:30:00Z",
        "mentions": [],
        "type": "comment",
        "attachments": [
          {
            "id": "1",
            "name": "error-screenshot.png",
            "url": "/api/attachments/error-screenshot.png",
            "type": "image",
            "size": 245760,
            "uploadedBy": "João Silva",
            "uploadedAt": "2025-07-15T11:15:00Z"
          }
        ]
      }
    ]
  }
}
```

#### Response `GET /priorities`

```json
{
  "priorities": [
    {
      "id": "priority-1",
      "name": "Baixa",
      "color": "#4caf50",
      "level": 1,
      "description": "Prioridade baixa",
      "isActive": true
    }
  ]
}
```

#### Response `GET /tags`

```json
{
  "tags": [
    {
      "id": "tag-1",
      "name": "Bug",
      "color": "#f44336",
      "description": "Problemas no sistema",
      "isActive": true,
      "category": "Sistema"
    }
  ]
}
```

---

## 5. Estoque (Inventory)

### Tabela: `inventory_movements`

| Campo           | Tipo      | Descrição     |
| --------------- | --------- | ------------- |
| id (PK)         | UUID      | Identificador |
| product_id (FK) | UUID      | Produto       |
| descricao       | VARCHAR   | Descrição     |
| quantidade      | INTEGER   | Quantidade    |
| tipo            | VARCHAR   | entrada/saida |
| data            | TIMESTAMP | Data          |
| motivo          | VARCHAR   | Motivo        |
| responsavel     | VARCHAR   | Responsável   |
| observacoes     | TEXT      | Observações   |

### Rotas

- `GET /inventory` (listar, filtros por produto, tipo, data)
- `POST /inventory` (nova movimentação)

#### Filtros possíveis em `GET /inventory`

- `codigoProduto` (string, busca parcial)
- `descricao` (string, busca parcial)
- `tipo` (entrada/saida)
- `dataInicial` (date, data mínima)
- `dataFinal` (date, data máxima)

#### Response `GET /inventory`

```json
{
  "movements": [
    {
      "id": "uuid",
      "codigoProduto": "PROD001",
      "descricao": "Produto A",
      "quantidade": 10,
      "tipo": "entrada",
      "data": "2025-01-15T10:00:00Z",
      "motivo": "Compra",
      "responsavel": "João Silva",
      "observacoes": "Entrada de estoque"
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 10
}
```

---

## 6. Produtos (Products)

### Tabela: `products`

| Campo              | Tipo    | Descrição     |
| ------------------ | ------- | ------------- |
| id (PK)            | UUID    | Identificador |
| codigo_produto     | VARCHAR | Código        |
| nome_produto       | VARCHAR | Nome          |
| descricao          | VARCHAR | Descrição     |
| preco              | NUMERIC | Preço         |
| quantidade_estoque | INTEGER | Estoque       |
| ultima_data_venda  | DATE    | Última venda  |
| fornecedor         | VARCHAR | Fornecedor    |

### Rotas

- `GET /products` (listar, filtros)
- `GET /products/:id` (detalhes)
- `POST /products` (criar)
- `PUT /products/:id` (editar)
- `DELETE /products/:id` (remover)

#### Filtros possíveis em `GET /products`

- `codigoProduto` (string, busca parcial)
- `nomeProduto` (string, busca parcial)
- `descricao` (string, busca parcial)
- `fornecedor` (string, exato)
- `precoMin` (number, preço mínimo)
- `precoMax` (number, preço máximo)
- `quantidadeEstoqueMin` (number, estoque mínimo)
- `quantidadeEstoqueMax` (number, estoque máximo)

#### Response `GET /products`

```json
{
  "products": [
    {
      "id": 1,
      "codigoProduto": "PROD001",
      "nomeProduto": "Produto Premium A",
      "descricaoProduto": "Descrição do produto",
      "preco": 150.0,
      "quantidadeEstoque": 50,
      "ultimaDataVenda": "2025-01-15",
      "fornecedor": "Fornecedor A"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

#### Response `GET /products/:id`

```json
{
  "product": {
    "id": 1,
    "codigoProduto": "PROD001",
    "nomeProduto": "Produto Premium A",
    "descricaoProduto": "Descrição do produto",
    "preco": 150.0,
    "quantidadeEstoque": 50,
    "ultimaDataVenda": "2025-01-15",
    "fornecedor": "Fornecedor A"
  }
}
```

---

## 7. Representantes (Sales Representatives)

### Tabela: `representatives`

| Campo         | Tipo      | Descrição                         |
| ------------- | --------- | --------------------------------- |
| id (PK)       | UUID      | Identificador                     |
| name          | VARCHAR   | Nome                              |
| email         | VARCHAR   | Email                             |
| avatar        | VARCHAR   | Letra/avatar                      |
| region        | VARCHAR   | Região                            |
| status        | VARCHAR   | active/inactive/vacation/training |
| total_sales   | NUMERIC   | Total de vendas                   |
| monthly_goal  | NUMERIC   | Meta mensal                       |
| clients_count | INTEGER   | Quantidade de clientes            |
| last_activity | TIMESTAMP | Última atividade                  |

### Rotas

- `GET /representatives` (listar, filtros)
- `GET /representatives/:id` (detalhes)
- `POST /representatives` (criar)
- `PUT /representatives/:id` (editar)
- `DELETE /representatives/:id` (remover)

#### Filtros possíveis em `GET /representatives`

- `name` (string, busca parcial)
- `region` (string, exato)
- `status` (active, inactive, vacation, training)

#### Response `GET /representatives`

```json
{
  "representatives": [
    {
      "id": "uuid",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "avatar": "J",
      "region": "São Paulo",
      "status": "active",
      "totalSales": 15000.0,
      "monthlyGoal": 20000.0,
      "clientsCount": 25,
      "lastActivity": "2025-01-15T10:00:00Z"
    }
  ],
  "regions": ["São Paulo", "Rio de Janeiro", "Belo Horizonte"],
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

#### Response `GET /representatives/:id`

```json
{
  "representative": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "avatar": "J",
    "region": "São Paulo",
    "status": "active",
    "totalSales": 15000.0,
    "monthlyGoal": 20000.0,
    "clientsCount": 25,
    "lastActivity": "2025-01-15T10:00:00Z"
  }
}
```

---

## 8. Catálogo (Catalog)

- O catálogo pode ser uma listagem de produtos, com filtros por categoria, preço, disponibilidade, etc.
- Utilizar a tabela `products`.
- Rotas:
  - `GET /catalog` (listar produtos, filtros)

#### Filtros possíveis em `GET /catalog`

- `nomeProduto` (string, busca parcial)
- `descricao` (string, busca parcial)
- `categoria` (string, exato, se houver)
- `precoMin` (number, preço mínimo)
- `precoMax` (number, preço máximo)
- `quantidadeEstoqueMin` (number, estoque mínimo)
- `quantidadeEstoqueMax` (number, estoque máximo)

#### Response `GET /catalog`

```json
{
  "products": [
    {
      "id": 1,
      "codigoProduto": "PROD001",
      "nomeProduto": "Produto Premium A",
      "descricaoProduto": "Descrição do produto",
      "preco": 150.0,
      "quantidadeEstoque": 50,
      "ultimaDataVenda": "2025-01-15",
      "fornecedor": "Fornecedor A"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10
}
```

---

## 9. Autenticação

- Usuários, login, JWT, permissões básicas.
- Tabela sugerida: `users` (id, nome, email, senha_hash, role, created_at, updated_at)
- Rotas:
  - `POST /auth/login`
  - `POST /auth/register` (opcional)
  - `GET /auth/me`

#### Response `POST /auth/login`

```json
{
  "user": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "role": "admin"
  },
  "token": "jwt-token-here",
  "message": "Login realizado com sucesso"
}
```

#### Response `GET /auth/me`

```json
{
  "user": {
    "id": "uuid",
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
}
```

---

## 10. Docker

- Dockerfile para NestJS
- docker-compose.yml para subir o backend + banco PostgreSQL

---

## Observações

- Todos os endpoints devem validar payloads e retornar erros claros.
- Utilizar migrations para criar as tabelas.
- Relacionamentos devem ser respeitados (FKs, N:N para tags/tickets, etc).
- O backend deve ser preparado para evoluir (ex: adicionar novos campos, entidades, permissões).
- **Todos os retornos devem vir dentro de um objeto `{}`** para manter padrão.
