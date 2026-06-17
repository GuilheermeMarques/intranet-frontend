# Frontend Refactor — Products/Catalog Vertical Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Apply the proven clients-vertical pattern (English contract + React Query + mock adapter) to the `products`/`catalog` vertical.

**Architecture:** Sibling of `2026-06-16-frontend-refactor-foundation.md`. No dead-code/island work (done already). Single English `Product` contract in `src/features/products/types.ts`, mock adapter + React Query hook (TDD), rewire `app/catalog/page.tsx`, migrate the other 4 product-mock consumers, delete legacy `src/types/product.ts`. All over mocks.

**Tech Stack:** Next.js 15, TypeScript, MUI, TanStack React Query v5, Jest + RTL.

**Working dir:** `intranet-frontend/`. Branch: `refactor/frontend-products`.

**Env constraints:** Cypress cannot run in the sandbox — use `npm test` + `npm run build` as gates. Pre-existing tsc matcher noise lives only in `*.test.*` files; ignore it.

**Field mapping (PT→EN):** `codigoProduto→code, nomeProduto→name, descricaoProduto→description, preco→price, quantidadeEstoque→stockQuantity, ultimaDataVenda→lastSaleAt, fornecedor→supplier, categoria→category, imagem→imageUrl, ativo→active`. `id`, `createdAt`, `updatedAt` unchanged.

---

## Task P1: English Product contract

**Create:** `src/features/products/types.ts`

```ts
export interface Product {
  id: string | number;
  code: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  lastSaleAt: string;
  supplier: string;
  category?: string;
  imageUrl?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductFilters {
  code: string;
  name: string;
  supplier: string;
}
```

- [ ] Create the file, `npm run type-check` (no NEW errors beyond test-file noise), commit `feat(frontend): add English Product contract in features/products/types.ts`.

## Task P2: Rename products mock to English keys

**Modify:** `src/mocks/products.json`

- [ ] Read the file. For EVERY object in `products`, rename whatever PT keys are present per the mapping (objects vary — some lack `categoria`/`imagem`/`ativo`; only rename keys that exist). Preserve all values (including numeric `id` and accents). Keep top-level structure `{ "products": [...] }`.
- [ ] Validate parse: `node -e "JSON.parse(require('fs').readFileSync('src/mocks/products.json','utf8')); console.log('ok')"`.
- [ ] Note (do not fix) that consumers reading PT keys now break — fixed in P5/P6. Commit `refactor(frontend): rename products mock keys to English`.

## Task P3: Products mock API adapter (TDD)

**Create:** `src/features/products/api/productsApi.ts`, test `src/features/products/api/productsApi.test.ts`

- [ ] Write failing test first:

```ts
import { productsApi } from './productsApi';

describe('productsApi', () => {
  it('returns all products when no filters are given', async () => {
    const result = await productsApi.list();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('code');
    expect(result[0]).toHaveProperty('name');
  });

  it('filters by code (case-insensitive, partial)', async () => {
    const result = await productsApi.list({ code: 'prod001' });
    expect(result.every((p) => p.code.toLowerCase().includes('prod001'))).toBe(true);
  });

  it('filters by name (case-insensitive, partial)', async () => {
    const all = await productsApi.list();
    const term = all[0].name.slice(0, 3).toLowerCase();
    const result = await productsApi.list({ name: term });
    expect(result.every((p) => p.name.toLowerCase().includes(term))).toBe(true);
  });

  it('filters by supplier (case-insensitive, partial)', async () => {
    const all = await productsApi.list();
    const term = all[0].supplier.slice(0, 3).toLowerCase();
    const result = await productsApi.list({ supplier: term });
    expect(result.every((p) => p.supplier.toLowerCase().includes(term))).toBe(true);
  });

  it('returns a single product by id (coercing types)', async () => {
    const all = await productsApi.list();
    const id = all[0].id;
    const product = await productsApi.getById(id);
    expect(String(product?.id)).toBe(String(id));
  });
});
```

- [ ] Run it, confirm FAIL. Then implement:

```ts
import productsMock from '@/mocks/products.json';
import type { Product, ProductFilters } from '../types';

const products = productsMock.products as Product[];

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const productsApi = {
  async list(filters?: Partial<ProductFilters>): Promise<Product[]> {
    await delay(0);
    let result = [...products];

    if (filters?.code?.trim()) {
      const term = filters.code.toLowerCase();
      result = result.filter((p) => p.code.toLowerCase().includes(term));
    }
    if (filters?.name?.trim()) {
      const term = filters.name.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(term));
    }
    if (filters?.supplier?.trim()) {
      const term = filters.supplier.toLowerCase();
      result = result.filter((p) => p.supplier.toLowerCase().includes(term));
    }

    return result;
  },

  async getById(id: string | number): Promise<Product | null> {
    await delay(0);
    return products.find((p) => String(p.id) === String(id)) ?? null;
  },
};
```

If `productsMock.products as Product[]` needs `as unknown as Product[]`, use that and note it.

- [ ] Run test → PASS (5). Commit `feat(frontend): add products mock API adapter with filter logic`.

## Task P4: useProductsQuery hook (TDD)

**Create:** `src/features/products/hooks/useProductsQuery.ts`, test `src/features/products/hooks/useProductsQuery.test.tsx`

- [ ] Write failing test first:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { useProductsQuery } from './useProductsQuery';

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('useProductsQuery', () => {
  it('loads products through the api adapter', async () => {
    const { result } = renderHook(
      () => useProductsQuery({ code: '', name: '', supplier: '' }),
      { wrapper },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((result.current.data ?? []).length).toBeGreaterThan(0);
  });
});
```

- [ ] Run it, confirm FAIL. Then implement:

```ts
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api/productsApi';
import type { ProductFilters } from '../types';

export function useProductsQuery(filters: ProductFilters) {
  return useQuery({
    queryKey: ['products', filters.code, filters.name, filters.supplier],
    queryFn: () => productsApi.list(filters),
  });
}
```

- [ ] Run test → PASS. Commit `feat(frontend): add useProductsQuery React Query hook`.

## Task P5: Rewire `app/catalog/page.tsx`

**Modify:** `src/app/catalog/page.tsx` (199 lines; keep it one page — no decomposition)

- [ ] Read the file. Replace `import productsData from '@/mocks/products.json';` with `import { useProductsQuery } from '@/features/products/hooks/useProductsQuery';` and add `import { ProductFilters } from '@/features/products/types';`.
- [ ] Type the filter state as `ProductFilters` and rename its keys `codigoProduto/nomeProduto/fornecedor → code/name/supplier` (state init, `handleFilterChange`, all `filters.<x>` reads, and the column/filter-field `id`s: `codigoProduto→code, nomeProduto→name, preco→price, quantidadeEstoque→stockQuantity, fornecedor→supplier`).
- [ ] Replace the `useMemo` filter block (filters `productsData.products` by code/name/supplier) with:
```tsx
const { data, isLoading } = useProductsQuery(filters);
const filteredProducts = data ?? [];
```
- [ ] Add a minimal loading state (e.g. `isLoading ? <CircularProgress/> : <DataTable .../>`).
- [ ] Verify no PT field identifiers or mock import remain: `grep -n "codigoProduto\|nomeProduto\|fornecedor\|preco\|quantidadeEstoque\|@/mocks/products" src/app/catalog/page.tsx` → only user-facing label STRINGS allowed (e.g. placeholder "Digite o nome do fornecedor"), no field identifiers.
- [ ] `npx tsc --noEmit 2>&1 | grep "app/catalog/page.tsx"` → zero. (Build still red due to P6 files — expected.) `npm test`, `npm run lint`. Commit `refactor(frontend): wire catalog page to React Query + English Product contract`.

## Task P6: Migrate remaining consumers + delete legacy type (green gate)

**Modify:** `src/app/sales/orders/new/components/NewOrderForm.tsx`, `src/app/inventory/new/page.tsx`, `src/app/budgets/page.tsx`
**Delete:** `src/types/product.ts`

These keep reading `@/mocks/products.json` directly (NOT moved to the hook — out of scope) but need English field renames + type-import repoint.

- [ ] Discover: `grep -rln "@/types/product" src` and `grep -rln "@/mocks/products" src` (exclude `features/products/*` and the mock file).
- [ ] In each consumer: repoint `@/types/product` → `@/features/products/types`; rename every PT product-field access to English per the mapping (e.g. `product.codigoProduto→code`, `nomeProduto→name`, `preco→price`, `quantidadeEstoque→stockQuantity`, `fornecedor→supplier`, `descricaoProduto→description`, `ultimaDataVenda→lastSaleAt`, `categoria→category`, `imagem→imageUrl`, `ativo→active`). `String(product.id)` coercions stay. Preserve user-facing Portuguese label strings. Run `npx tsc --noEmit` after each file until that file is clean.
- [ ] CAUTION: `src/types/purchase.ts` defines a DIFFERENT `Product` (name/quantity/unitPrice/total) — do NOT touch it or its consumers. Stay scoped to the catalog/products `Product`.
- [ ] `git rm src/types/product.ts` (if it reports still-referenced, a consumer was missed).
- [ ] Green gate: `npx tsc --noEmit 2>&1 | grep -v "__tests__\|\.test\.\|\.spec\."` → zero production errors; `npm test -- --watchAll=false` → all pass; `npm run lint` → no new errors; `npm run build` → SUCCESS (all routes); `npm run knip` → `src/types/product.ts` gone, no new dead code.
- [ ] Commit `git add -A` → `refactor(frontend): migrate product consumers to English contract; remove legacy @/types/product`.

## Done Criteria

- `app/catalog/page.tsx` flows through `useProductsQuery`; no `@/mocks/products` or PT field identifiers.
- `src/features/products/` holds the English `Product` contract, adapter, and hook, each tested.
- All 4 former mock consumers compile on the English contract; `src/types/product.ts` deleted.
- Full Jest green + `npm run build` succeeds.
