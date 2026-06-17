# Backend F5 — Products + Inventory (sales context) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Two more `sales`-context domains — products (full CRUD + lookups) and inventory movements (list + create + lookups) — matching the frontend English contracts. Follows the F4 clients pattern exactly (`docs/superpowers/plans/2026-06-17-backend-f4-clients.md` is the reference for mechanical controller/mapper/repo/routing patterns).

**Architecture:** DDD, context `sales`. Use-cases return `Either`; unit specs use in-memory repos. Money as `Float` (number). Endpoints (spec §7.2):
- Products: `GET /products` (?code&name&category&supplier → `{products[]}`), `GET /products/:id`, `POST /products`, `PATCH /products/:id`, `DELETE /products/:id`, `GET /products/lookups` (→ `{categories[], suppliers[]}`).
- Inventory: `GET /inventory/movements` (?productCode&description&type&startDate&endDate → `{movements[]}`), `POST /inventory/movements` (→ `{movement}`), `GET /inventory/lookups` (→ `{types[], reasons[]}`).

**Contracts:**
- `Product { id, code, name, description, price:number, stockQuantity:number, lastSaleAt:string|null, supplier, category:string|null, imageUrl:string|null, active:boolean }`
- `InventoryMovement { id, productCode, description, quantity:number, type:'inbound'|'outbound', occurredAt:string, reason:string|null, handledBy:string|null, notes:string|null }`

**CRITICAL controller patterns (from F4):**
- Param/body routes: use **param-level** `@Body(new ZodValidationPipe(schema))` — NEVER method-level `@UsePipes` when a `@Param`/`@CurrentUser` is also present (it corrupts those args).
- Routing order in `http.module.ts`: literal segments (`/products/lookups`) BEFORE `/products/:id`.

**Working dir:** repo root; backend `intranet-backend/`. Branch `feat/backend-f5-products-inventory`. No Docker — gates: `pnpm test`, `pnpm prisma generate`, `pnpm build`.

---

## PART 1 — PRODUCTS

### Task 1: Product entity + repository + in-memory repo
- [ ] `src/domain/sales/enterprise/entities/product.ts` — `Entity<ProductProps>` with props `code, name, description, price, stockQuantity, lastSaleAt?:Date|null, supplier, category?:string|null, imageUrl?:string|null, active` and getters + setters for the editable fields (name, description, price, stockQuantity, supplier, category, imageUrl, active, lastSaleAt). `static create(props: Optional<ProductProps, 'active'|'lastSaleAt'|'category'|'imageUrl'>, id?)` defaults `active: props.active ?? true`, `lastSaleAt ?? null`, `category ?? null`, `imageUrl ?? null`.
- [ ] `src/domain/sales/application/repositories/products-repository.ts`:
```ts
import { Product } from '../../enterprise/entities/product'

export interface ProductFilters {
  code?: string
  name?: string
  category?: string
  supplier?: string
}

export abstract class ProductsRepository {
  abstract findMany(filters: ProductFilters): Promise<Product[]>
  abstract findById(id: string): Promise<Product | null>
  abstract findDistinctCategories(): Promise<string[]>
  abstract findDistinctSuppliers(): Promise<string[]>
  abstract count(): Promise<number>
  abstract create(product: Product): Promise<void>
  abstract save(product: Product): Promise<void>
  abstract delete(product: Product): Promise<void>
}
```
- [ ] `test/repositories/in-memory-products-repository.ts` — implement all methods. `findMany`: code (partial, ci), name (partial, ci), category (exact), supplier (partial, ci). `findDistinctCategories`: distinct non-null categories sorted. `findDistinctSuppliers`: distinct suppliers sorted.
- [ ] Commit `feat(backend): add Product entity, repository and in-memory repo`.

### Task 2: Product use-cases (TDD)
Write each spec FIRST → FAIL → implement → PASS. Mirror F4's client use-cases:
- [ ] `fetch-products.ts` ({ filters } → `{ products: Product[] }`)
- [ ] `get-product-by-id.ts` (→ `{ product }` / `ResourceNotFoundError`)
- [ ] `fetch-product-lookups.ts` (→ `{ categories: string[]; suppliers: string[] }`)
- [ ] `create-product.ts` — auto-generate `code = PROD${String(count+1).padStart(3,'0')}`; request fields: `name, description, price, stockQuantity, supplier, category?, imageUrl?`; defaults active true, lastSaleAt null. → `{ product }`
- [ ] `edit-product.ts` — patch provided fields (name, description, price, stockQuantity, supplier, category, imageUrl, active); `ResourceNotFoundError` if missing. → `{ product }`
- [ ] `delete-product.ts` — `ResourceNotFoundError` if missing → `right(null)`
- [ ] Commit `feat(backend): add product use-cases (fetch, by-id, lookups, create, edit, delete) (TDD)`.

### Task 3: Products Prisma + presenter + controllers
- [ ] `prisma/schema.prisma` — add:
```prisma
model Product {
  id            String    @id @default(uuid())
  code          String    @unique
  name          String
  description   String
  price         Float
  stockQuantity Int       @default(0) @map("stock_quantity")
  lastSaleAt    DateTime? @map("last_sale_at")
  supplier      String
  category      String?
  imageUrl      String?   @map("image_url")
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime? @updatedAt @map("updated_at")

  @@index([name])
  @@index([category])
  @@map("products")
}
```
- [ ] `pnpm prisma generate`.
- [ ] `prisma-product-mapper.ts` (toDomain/toPrisma; `Prisma.ProductUncheckedCreateInput`; nulls for optional fields).
- [ ] `prisma-products-repository.ts` (mirror F4 clients repo; `findMany` builds `Prisma.ProductWhereInput` with `contains/mode:'insensitive'` for code/name/supplier and exact category; `findDistinctCategories`/`findDistinctSuppliers` via `findMany({ distinct, select, orderBy })`; filter out null categories).
- [ ] Wire `ProductsRepository` → `PrismaProductsRepository` in `database.module.ts`.
- [ ] `product-presenter.ts` → `{ id, code, name, description, price, stockQuantity, lastSaleAt: x?toISOString():null, supplier, category: x??null, imageUrl: x??null, active }`.
- [ ] Controllers (6) under `src/infra/http/controllers/`, following F4 patterns + param-level body pipe:
  - `fetch-products.controller.ts` — `@Controller('/products')` `@Get()`, `@Query()` parsed with a Zod query schema `{code?,name?,category?,supplier?}` → `{ products }`.
  - `get-product-lookups.controller.ts` — `@Controller('/products/lookups')` `@Get()` → `{ categories, suppliers }`.
  - `create-product.controller.ts` — `@Controller('/products')` `@Post()` `@Body(new ZodValidationPipe(createProductBodySchema))` → `{ product }`.
  - `get-product-by-id.controller.ts` — `@Controller('/products/:id')` `@Get()` → `{ product }` / 404.
  - `edit-product.controller.ts` — `@Controller('/products/:id')` `@Patch()` `@Param('id')` + `@Body(new ZodValidationPipe(editProductBodySchema))` → `{ product }` / 404.
  - `delete-product.controller.ts` — `@Controller('/products/:id')` `@Delete()` `@HttpCode(204)` → 404 if missing.
  - Zod schemas (in `controllers/schemas/product-body-schema.ts`): `createProductBodySchema = z.object({ name, description, price:z.number(), stockQuantity:z.number().int(), supplier, category:z.string().optional(), imageUrl:z.string().optional() })`; `editProductBodySchema = createProductBodySchema.partial().extend({ active: z.boolean().optional() })`; `productQuerySchema = z.object({ code:z.string().optional(), name:z.string().optional(), category:z.string().optional(), supplier:z.string().optional() })`.
- [ ] Register the 6 controllers (lookups before `:id`) + 6 use-cases in `http.module.ts`.
- [ ] Commit `feat(backend): add products endpoints (CRUD + lookups)`.

---

## PART 2 — INVENTORY

### Task 4: InventoryMovement entity + repository + in-memory repo
- [ ] `src/domain/sales/enterprise/entities/inventory-movement.ts` — `Entity<InventoryMovementProps>` props `productCode, description, quantity, type:'inbound'|'outbound', occurredAt:Date, reason?:string|null, handledBy?:string|null, notes?:string|null`. `static create(props: Optional<..., 'occurredAt'|'reason'|'handledBy'|'notes'>, id?)` defaults `occurredAt ?? new Date()`, others `?? null`. Getters only (movements are immutable once created — no setters needed).
- [ ] `src/domain/sales/application/repositories/inventory-movements-repository.ts`:
```ts
import { InventoryMovement } from '../../enterprise/entities/inventory-movement'

export interface InventoryMovementFilters {
  productCode?: string
  description?: string
  type?: string
  startDate?: Date | null
  endDate?: Date | null
}

export abstract class InventoryMovementsRepository {
  abstract findMany(filters: InventoryMovementFilters): Promise<InventoryMovement[]>
  abstract create(movement: InventoryMovement): Promise<void>
}
```
- [ ] `test/repositories/in-memory-inventory-movements-repository.ts` — `findMany`: productCode (partial ci), description (partial ci), type (exact), date range on `occurredAt`; sort by occurredAt desc.
- [ ] Commit `feat(backend): add InventoryMovement entity, repository and in-memory repo`.

### Task 5: Inventory use-cases (TDD)
- [ ] `fetch-inventory-movements.ts` ({ filters } → `{ movements: InventoryMovement[] }`). spec: 3 movements, filter by type + date range.
- [ ] `create-inventory-movement.ts` — request `{ productCode, description, quantity, type, reason?, handledBy?, notes?, occurredAt? }` → creates entity, persists → `{ movement }`. spec: asserts persisted + fields.
- [ ] `fetch-inventory-lookups.ts` → `{ types: string[]; reasons: string[] }`. Returns a FIXED catalog:
```ts
const TYPES = ['inbound', 'outbound']
const REASONS = ['Compra de fornecedor', 'Venda', 'Devolução', 'Ajuste de estoque', 'Transferência', 'Perda/Danificação']
```
  (no repo needed — pure constants; still an injectable use-case returning `right({ types: TYPES, reasons: REASONS })`). spec: asserts the arrays.
- [ ] Each spec FIRST → FAIL → implement → PASS. Commit `feat(backend): add inventory use-cases (fetch, create, lookups) (TDD)`.

### Task 6: Inventory Prisma + presenter + controllers
- [ ] `prisma/schema.prisma` — add:
```prisma
model InventoryMovement {
  id          String   @id @default(uuid())
  productCode String   @map("product_code")
  description String
  quantity    Int
  type        String
  occurredAt  DateTime @map("occurred_at")
  reason      String?
  handledBy   String?  @map("handled_by")
  notes       String?
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([productCode])
  @@index([occurredAt])
  @@map("inventory_movements")
}
```
- [ ] `pnpm prisma generate`.
- [ ] `prisma-inventory-movement-mapper.ts` (toDomain/toPrisma; `type` stored as String, mapped to the `'inbound'|'outbound'` union via `as InventoryMovementType` in toDomain).
- [ ] `prisma-inventory-movements-repository.ts` (findMany with `Prisma.InventoryMovementWhereInput`; create).
- [ ] Wire `InventoryMovementsRepository` in `database.module.ts`.
- [ ] `inventory-movement-presenter.ts` → `{ id, productCode, description, quantity, type, occurredAt: toISOString(), reason: x??null, handledBy: x??null, notes: x??null }`.
- [ ] Controllers (3):
  - `fetch-inventory-movements.controller.ts` — `@Controller('/inventory/movements')` `@Get()` `@Query()` (Zod schema `{productCode?,description?,type?,startDate?,endDate?}` with `z.coerce.date().optional()`) → `{ movements }`.
  - `create-inventory-movement.controller.ts` — `@Controller('/inventory/movements')` `@Post()` `@Body(new ZodValidationPipe(schema))` (schema `{ productCode, description, quantity:z.number().int(), type:z.enum(['inbound','outbound']), reason?, handledBy?, notes?, occurredAt: z.coerce.date().optional() }`) → `{ movement }`.
  - `get-inventory-lookups.controller.ts` — `@Controller('/inventory/lookups')` `@Get()` → `{ types, reasons }`.
- [ ] Register the 3 controllers + 3 use-cases in `http.module.ts`.
- [ ] Commit `feat(backend): add inventory endpoints (movements + lookups)`.

### Task 7: Seed + Gate
- [ ] (Optional) extend `prisma/seed.ts` with ~3 products (upsert by code, PROD001–PROD003) and ~2 inventory movements.
- [ ] GATE: `pnpm prisma generate`; `pnpm test` (all unit pass — products 6+ + inventory 3+ + existing 42); `pnpm build` → `dist/infra/main.js` exists.
- [ ] `git status` clean; nothing gitignored staged.
- [ ] Commit `feat(backend): seed sample products and inventory movements` (if seed extended).

---

## Done Criteria
- Products: entity/schema/repo + 6 use-cases (tested) + 6 endpoints (CRUD + lookups).
- Inventory: entity/schema/repo + 3 use-cases (tested) + 3 endpoints (movements + lookups).
- All routing uses param-level body pipes; literal routes before `:id`.
- `pnpm test` + `pnpm build` + `pnpm prisma generate` pass.

## Next (F6)
- representatives + orders + budgets (orders/budgets are aggregates with item snapshots).
