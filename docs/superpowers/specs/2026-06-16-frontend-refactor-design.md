# Design — Refactor do Frontend da Intranet

- **Data:** 2026-06-16
- **Repositório:** `intranet-frontend/` (monorepo com `intranet-backend/`)
- **Relacionado:** `2026-06-16-intranet-backend-design.md` (este refactor é dono do workstream PT→EN antes referido na §9 daquele spec)
- **Status:** Aprovado para escrita de plano de implementação

## 1. Objetivo

Sanear a arquitetura do frontend **antes** da integração com o backend: remover a migração
"Clean Architecture" abandonada na metade, unificar contratos (um tipo em inglês por entidade),
estabelecer uma camada de dados única com React Query e quebrar páginas monolíticas em componentes
de feature. Todo o trabalho é feito **sobre os mocks atuais**; quando o backend chegar (fase F10 do
backend), basta trocar a fonte dos services.

## 2. Decisões de design (confirmadas)

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Estratégia | **B — apagar código morto + camada de dados única e enxuta** (sem `usecases`/`repositories` no front) |
| 2 | Sequenciamento | **Refactor estrutural agora, sobre mocks**; integração real só na F10 do backend |
| 3 | Entrega | Spec separada (este documento) + plano via `writing-plans` |
| 4 | Idioma dos contratos | **Inglês (camelCase)**, alinhado ao backend (mesmo mapeamento da §9 do spec do backend) |

## 3. Diagnóstico (com evidência)

O `CLEAN_CODE_ANALYSIS.md` declara "Fase 1 — Fundação: 100%", incluindo a criação de
`domain/`, `presentation/` e `infrastructure/`. A migração, porém, **nunca foi conectada às páginas**.
Verificação por `grep` de imports:

### 3.1 Ilha de código morto (auto-referente, 0 usos pela aplicação real)

- `domain/**` (entities, usecases, repositories) — **0 imports** fora de `domain/`.
- `infrastructure/services/api.ts` (API mock pronta para React Query) — **0 imports**.
- `infrastructure/storage/**` (stores zustand + testes) — usado apenas por `presentation/hooks/useClients.ts`, que também é órfão.
- `presentation/hooks/**` exceto `useAuth` (`useClientsQuery`, `useOrdersQuery`, `useClients`, `useClientsFilters`, `useClientForm`, `useOrderCalculations`, `useDebounce`, `useInfiniteScroll`) — **0 usos** pelas páginas.
- `presentation/components/{VirtualizedDataTable, LazyPage, LoadingSpinner, ProtectedRoute, clients/*}` e `presentation/pages/lazy/*` — só importam uns aos outros.
- `zustand` (dependência) — **não importado em lugar nenhum**.

### 3.2 O que realmente roda

- As **15 páginas** em `app/*/page.tsx` leem `@/mocks/*.json` **direto**, com `useState`/`useMemo`.
- Usam `components/*` (DashboardLayout, DataTable, FilterPanel, Modal) e `contexts/*` (ThemeContext, AccessControlContext).
- Do `presentation/`, vivos: apenas `QueryProvider` + `SessionProvider` (em `app/layout.tsx`) e `useAuth` (em `app/login/page.tsx`).

### 3.3 Problemas resultantes

1. **React Query inerte:** `QueryProvider` montado, mas nenhuma página chama `useQuery`. Cache/staleTime/mutations sem efeito.
2. **Páginas monolíticas:** `app/tickets/page.tsx` = **1366 linhas**; `budgets` 694; `clients` 509; `settings/permissions` 484; `inventory/new` 324. A lógica "extraída" para componentes existe mas não é usada.
3. **Contratos triplicados e divergentes:** `types/*` vs `domain/entities/*` vs `mocks/*`, em PT/EN misturado.
4. **Falsa arquitetura:** o scaffolding limpo mascara que o código real é monolítico e acoplado a JSON.
5. **Dependências fantasma:** `zustand`, e (com a decisão de JWT nativo no backend) `next-auth`/`@auth/*`/`express-rate-limit`/`jsonwebtoken`.

## 4. Arquitetura-alvo (lean, feature-based)

```text
src/
  app/                          # rotas finas: cada page.tsx só compõe um container de feature
  features/
    <domain>/                   # clients, products, inventory, representatives, orders, budgets,
                                #   tickets, ticket-priorities, ticket-tags, permissions, auth, dashboard
      components/               # UI da feature (Form, Filters, List, Details)
      hooks/                    # React Query: use<Entity>Query, useCreate/Update/Delete<Entity>
      api/                      # funções de serviço sobre o httpClient (mock adapter por ora)
      types.ts                  # contrato ÚNICO em inglês da entidade (alinhado ao backend)
  components/                   # UI compartilhada: DashboardLayout, DataTable, FilterPanel, Modal
  services/
    httpClient.ts               # fetch/axios: baseURL, header Authorization, normalização de erro
    queryClient.ts              # movido de infrastructure/services
  contexts/                     # ThemeContext; AccessControl/Session lendo permissões reais
  shared/{utils, constants, types}
  lib/
```

Princípios:
- O front **não** tem `usecases`/`repositories` próprios — regra de negócio é do backend. A camada
  de dados é fina: `api/` (chamada) + `hooks/` (cache/estado de servidor via React Query).
- **Um tipo por entidade** em `features/<domain>/types.ts` (ou `shared/types` quando compartilhado).
- Páginas (`app/*/page.tsx`) ficam finas: montam layout + container da feature.
- Fonte de dados trocável: hoje `api/` aponta para um adapter de mocks; na F10 aponta para `httpClient` real, sem tocar nos componentes.

## 5. Remoção (gated por ferramenta)

Adicionar **`knip`** (detecção de exports/arquivos/deps não usados) como rede de segurança e rodar
antes de cada remoção. Lista esperada de remoção (confirmar com `knip`):

- `src/domain/**`
- `src/infrastructure/services/api.ts`
- `src/infrastructure/storage/**` (stores zustand + testes)
- `src/presentation/hooks/**` exceto `useAuth` (mover `useAuth` para `features/auth/` ou `services/`)
- `src/presentation/components/{VirtualizedDataTable, LazyPage, LoadingSpinner, ProtectedRoute}` e `src/presentation/components/clients/**`
- `src/presentation/pages/lazy/**`
- `src/middlewares/**` (vazio)
- dependência `zustand` do `package.json`
- (com auth do backend) `next-auth`, `@auth/core`, `@auth/prisma-adapter`, `express-rate-limit`, `jsonwebtoken` — **removidas na F10/integração**, não agora

Mover (não deletar):
- `presentation/components/{QueryProvider, SessionProvider}` → `app/providers/` ou `services/`
- `infrastructure/services/queryClient.ts` → `services/queryClient.ts`

Manter e religar:
- `components/**` (consolidar os dois Modais e usar um único DataTable)
- `contexts/ThemeContext` (mantém) e `contexts/AccessControlContext` (passa a consumir `permissions[]` reais em vez do mock)
- `shared/utils/**` (formatters, validationSchemas, sanitization, etc.)

## 6. Unificação de contratos (PT → EN)

Mesmo mapeamento da §9 do spec do backend (este documento é o dono do workstream):

- **Client:** `codigo→code, nome→name, cpf→document, cep→zipCode, endereco→street, cidade→city, estado→state, bairro→neighborhood, numero→number, complemento→complement, telefone→phone, dataUltimaCompra→lastPurchaseAt, quantidadeCompras→purchaseCount`.
- **Product:** `codigoProduto→code, nomeProduto→name, descricaoProduto→description, preco→price, quantidadeEstoque→stockQuantity, ultimaDataVenda→lastSaleAt, fornecedor→supplier, categoria→category, ativo→active, imagem→imageUrl`.
- **InventoryMovement:** `codigoProduto→productCode, descricao→description, quantidade→quantity, tipo→type (entrada→inbound, saida→outbound), data→occurredAt, motivo→reason, responsavel→handledBy, observacoes→notes`.
- Orders, budgets, tickets, representatives já estão em inglês.

Cada entidade fica com **um** tipo em `features/<domain>/types.ts`. Os `src/types/*` e
`src/domain/entities/*` antigos são consolidados/removidos. Mocks (`src/mocks/*.json`) renomeados
para chaves EN.

## 7. Decomposição das páginas monolíticas

Quebrar, por ordem de tamanho/risco, em `features/<domain>/components` + `hooks`, deixando
`app/*/page.tsx` fino:

1. `tickets/page.tsx` (1366) → `TicketBoard`, `TicketColumn`, `TicketCard`, `TicketDetailsDrawer`, `TicketForm`, `useTicketsQuery` + filtros.
2. `budgets/page.tsx` (694) → `BudgetList`, `BudgetFilters`, `BudgetForm`, `useBudgetsQuery`.
3. `clients/page.tsx` (509) → `ClientList`, `ClientFilters`, `ClientForm`, `useClientsQuery`.
4. `settings/permissions/page.tsx` (484) → `UserPermissionsTable`, `PermissionMatrix`, `useUsersQuery`/`usePermissionsMutation` (sai do `localStorage`).
5. `inventory/new/page.tsx` (324), `tickets/priorities` (292), `tickets/tags` (280), `home` (272), `inventory` (248), `sales/orders` (243), `sales/representatives` (237), `catalog` (199).

Regra de pronto por página: a `page.tsx` não contém lógica de filtro/CRUD inline; dados vêm de um hook React Query; componentes de feature isolados e testáveis.

## 8. Faseamento do refactor (sobre mocks)

- **R0 — Rede de segurança:** adicionar `knip`; garantir Jest + Cypress verdes como baseline; documentar cobertura atual.
- **R1 — Remover a ilha morta:** deletar `domain/**`, `presentation/**` órfão, `infrastructure/services/api.ts`, `infrastructure/storage/**`, `middlewares/**`; remover `zustand`. Build + testes continuam verdes (era código sem uso).
- **R2 — Unificar contratos EN:** um tipo por entidade em `features/<domain>/types.ts`; renomear mocks; remover `types/*` e `domain/entities/*` duplicados.
- **R3 — Camada de dados:** `services/httpClient.ts` + `services/queryClient.ts`; `features/<domain>/api/` (mock adapter) + hooks React Query. Páginas param de ler JSON direto.
- **R4 — Decompor páginas monolíticas** (ordem da §7), validando com Cypress a cada uma.
- **R5 — Providers e UI compartilhada:** consolidar providers em `app/providers`; `AccessControlContext` lendo permissões reais; unificar Modal/DataTable duplicados.
- **R6 — Estados de loading/empty/error** padronizados (preparo para API real).

Cada fase mantém Jest + Cypress verdes; nada de mudança visual de comportamento (refactor puro).

## 9. Relação com a integração do backend (F10)

Após R3, trocar mock→API real é: apontar `features/<domain>/api/` para o `httpClient` real e remover
o mock adapter — os componentes não mudam. A remoção de `next-auth`/`@auth/*` e a adoção do JWT
nativo acontecem na F10 (cross-ref spec do backend, §8 e §10). Os contratos já estarão em inglês e
únicos, eliminando o atrito de integração.

## 10. Riscos

- **`tickets/page.tsx` (1366 linhas)** é o maior risco/esforço; usa `@dnd-kit` (kanban). Decompor em passos pequenos com Cypress como guarda.
- **`knip`** pode apontar falsos positivos em arquivos só referenciados dinamicamente; revisar a lista antes de deletar.
- Renomear mocks pode quebrar testes que checam chaves PT; atualizar fixtures junto (R2).

## 11. Critério de pronto

- `knip` sem código morto reportado; `domain/`, `presentation/` órfão e `infrastructure/services/api.ts` removidos.
- Um tipo em inglês por entidade; `src/types/*` e `src/domain/entities/*` antigos eliminados.
- Toda página lê dados via hook React Query (mock adapter); nenhuma `page.tsx` importa `@/mocks/*` direto.
- `app/tickets/page.tsx`, `budgets`, `clients`, `settings/permissions` decompostas (cada `page.tsx` fina).
- `zustand` removido; providers consolidados; Modal/DataTable únicos.
- Jest + Cypress verdes; comportamento da UI inalterado.
