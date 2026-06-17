# Backend F6 — Representatives + Orders + Budgets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Finish the `sales` context — representatives (read-only list + lookups), orders (aggregate w/ item snapshots, CRUD + status), budgets (aggregate w/ item snapshots, CRUD). Matches the frontend English contracts.

**Architecture:** DDD, context `sales`. **Simplified aggregates:** Order/Budget hold `items` as a plain array (`OrderItem[]`/`BudgetItem[]`); item totals + order/budget totals are **computed** (not stored); the Prisma repo persists items transactionally (update parent + `deleteMany` + `createMany` items). Snapshots (`clientCode/clientName`, `productCode/productName`, `responsibleName`) are resolved at create/edit time from the clients/products/representatives repos and stored on the order/budget. Use-cases return `Either`; unit specs use in-memory repos.

**Reference patterns:** F4 clients + F5 products (`docs/superpowers/plans/2026-06-17-backend-f4-clients.md`, `...f5...`) for mechanical mapper/repo/controller/routing. **Always param-level `@Body(new ZodValidationPipe(...))`; literal routes before `/:id`.**

**Contracts (frontend `features/*/types.ts`):**
- `Representative { id, name, email, phone, region, status, totalSales:number, monthlyGoal:number, clientsCount:number, lastActivity:string, avatar }`
- `Order { id, clientId?, clientCode, clientName, clientEmail?, clientPhone?, items: OrderItem[], total:number, shippingCost:number, status:'pending'|'shipped'|'delivered'|'canceled', createdAt, updatedAt?, notes? }`; `OrderItem { id, productId?, productCode?, productName, quantity, unitPrice, total }`
- `Budget { id, number, clientId, clientName, responsibleId, responsibleName, createdAt, validityDate?, status:'pending'|'approved'|'rejected'|'expired', total:number, items: BudgetItem[] }`; `BudgetItem { id, productId, productCode?, productName, quantity, unitPrice, total }`

**Endpoints:**
- `GET /representatives` (?name&region&status → `{representatives[], regions[], statusOptions[]}`)
- `GET /orders` (?orderCode&clientName&status → `{orders[]}`), `GET /orders/:id`, `POST /orders`, `PATCH /orders/:id`, `PATCH /orders/:id/status`
- `GET /budgets` (?budgetNumber&clientId&responsibleId&status&startDate&endDate → `{budgets[]}`), `GET /budgets/:id`, `POST /budgets`, `PATCH /budgets/:id`, `DELETE /budgets/:id`

**Working dir:** repo root; backend `intranet-backend/`. Branch `feat/backend-f6-sales`. No Docker — gates: `pnpm test`, `pnpm prisma generate`, `pnpm build`.

---

## PART 1 — REPRESENTATIVES (read-only)

### Task 1: Representative vertical
- [ ] `src/domain/sales/enterprise/entities/representative.ts` — `Entity<RepresentativeProps>` props `name, email, phone, region, status, totalSales, monthlyGoal, clientsCount, lastActivity?:Date|null, avatar?:string|null`; getters only; `create(props, id?)` (lastActivity/avatar default null).
- [ ] `src/domain/sales/application/repositories/representatives-repository.ts`:
```ts
import { Representative } from '../../enterprise/entities/representative'

export interface RepresentativeFilters {
  name?: string
  region?: string
  status?: string
}

export abstract class RepresentativesRepository {
  abstract findMany(filters: RepresentativeFilters): Promise<Representative[]>
  abstract findDistinctRegions(): Promise<string[]>
}
```
- [ ] `test/repositories/in-memory-representatives-repository.ts` (findMany: name partial-ci, region exact, status exact; findDistinctRegions sorted).
- [ ] TDD `fetch-representatives.ts` use-case → `{ representatives, regions, statusOptions }`. statusOptions FIXED:
```ts
const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'vacation', label: 'Férias' },
  { value: 'training', label: 'Treinamento' },
]
```
  Return type: `Either<never, { representatives: Representative[]; regions: string[]; statusOptions: { value: string; label: string }[] }>`. spec: filter by region, assert regions + statusOptions present.
- [ ] Prisma: add `Representative` model:
```prisma
model Representative {
  id           String    @id @default(uuid())
  name         String
  email        String
  phone        String
  region       String
  status       String
  totalSales   Float     @default(0) @map("total_sales")
  monthlyGoal  Float     @default(0) @map("monthly_goal")
  clientsCount Int       @default(0) @map("clients_count")
  lastActivity DateTime? @map("last_activity")
  avatar       String?

  @@index([region])
  @@map("representatives")
}
```
  `pnpm prisma generate`. Create `prisma-representative-mapper.ts`, `prisma-representatives-repository.ts`, wire in `database.module.ts`.
- [ ] `representative-presenter.ts` → `{ id, name, email, phone, region, status, totalSales, monthlyGoal, clientsCount, lastActivity: x?toISOString():null, avatar: x??null }`.
- [ ] Controllers: `fetch-representatives.controller.ts` (`@Controller('/representatives')` `@Get()`, Zod query `{name?,region?,status?}`) → `{ representatives: rows.map(present), regions, statusOptions }`. Register controller + use-case in `http.module.ts`.
- [ ] Seed: add ~3 representatives (upsert by email or createMany guarded by count). Commit progressively (entity/repo, use-case, infra). Suggested single commit grouping: `feat(backend): add representatives (list + lookups)`.

---

## PART 2 — ORDERS (aggregate)

### Task 2: Order + OrderItem entities + repository + in-memory repo
- [ ] `src/domain/sales/enterprise/entities/order-item.ts`:
```ts
import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'

export interface OrderItemProps {
  productId?: string | null
  productCode?: string | null
  productName: string
  quantity: number
  unitPrice: number
}

export class OrderItem extends Entity<OrderItemProps> {
  get productId() { return this.props.productId }
  get productCode() { return this.props.productCode }
  get productName() { return this.props.productName }
  get quantity() { return this.props.quantity }
  get unitPrice() { return this.props.unitPrice }
  get total() { return this.props.quantity * this.props.unitPrice }

  static create(props: OrderItemProps, id?: UniqueEntityID) {
    return new OrderItem(props, id)
  }
}
```
- [ ] `src/domain/sales/enterprise/entities/order.ts`:
```ts
import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'
import { OrderItem } from './order-item'

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'canceled'

export interface OrderProps {
  orderCode: string
  clientId?: string | null
  clientCode: string
  clientName: string
  clientEmail?: string | null
  clientPhone?: string | null
  items: OrderItem[]
  shippingCost: number
  status: OrderStatus
  notes?: string | null
  createdAt: Date
  updatedAt?: Date | null
}

export class Order extends Entity<OrderProps> {
  get orderCode() { return this.props.orderCode }
  get clientId() { return this.props.clientId }
  get clientCode() { return this.props.clientCode }
  get clientName() { return this.props.clientName }
  get clientEmail() { return this.props.clientEmail }
  get clientPhone() { return this.props.clientPhone }
  get items() { return this.props.items }
  get shippingCost() { return this.props.shippingCost }
  get status() { return this.props.status }
  get notes() { return this.props.notes }
  get createdAt() { return this.props.createdAt }
  get updatedAt() { return this.props.updatedAt }

  get subtotal() { return this.props.items.reduce((sum, item) => sum + item.total, 0) }
  get total() { return this.subtotal + this.props.shippingCost }

  set items(items: OrderItem[]) { this.props.items = items; this.touch() }
  set shippingCost(value: number) { this.props.shippingCost = value; this.touch() }
  set status(value: OrderStatus) { this.props.status = value; this.touch() }
  set notes(value: string | null | undefined) { this.props.notes = value; this.touch() }

  private touch() { this.props.updatedAt = new Date() }

  static create(
    props: Optional<OrderProps, 'status' | 'shippingCost' | 'items' | 'createdAt'>,
    id?: UniqueEntityID,
  ) {
    return new Order(
      {
        ...props,
        status: props.status ?? 'pending',
        shippingCost: props.shippingCost ?? 0,
        items: props.items ?? [],
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    )
  }
}
```
- [ ] `src/domain/sales/application/repositories/orders-repository.ts`:
```ts
import { Order } from '../../enterprise/entities/order'

export interface OrderFilters {
  orderCode?: string
  clientName?: string
  status?: string
}

export abstract class OrdersRepository {
  abstract findMany(filters: OrderFilters): Promise<Order[]>
  abstract findById(id: string): Promise<Order | null>
  abstract count(): Promise<number>
  abstract create(order: Order): Promise<void>
  abstract save(order: Order): Promise<void>
}
```
- [ ] `test/repositories/in-memory-orders-repository.ts` (findMany: orderCode partial-ci against `orderCode`, clientName partial-ci, status exact; findById; count; create push; save replace via id.equals).
- [ ] Commit `feat(backend): add Order/OrderItem entities, repository and in-memory repo`.

### Task 3: Order use-cases (TDD)
CreateOrder/EditOrder resolve snapshots from clients + products repos (same context).
- [ ] `create-order.ts`:
```ts
import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { OrdersRepository } from '../repositories/orders-repository'
import { ClientsRepository } from '../repositories/clients-repository'
import { ProductsRepository } from '../repositories/products-repository'
import { Order } from '../../enterprise/entities/order'
import { OrderItem } from '../../enterprise/entities/order-item'

interface CreateOrderItemInput { productId: string; quantity: number; unitPrice?: number }
interface CreateOrderUseCaseRequest {
  clientId: string
  items: CreateOrderItemInput[]
  shippingCost?: number
  notes?: string
}
type CreateOrderUseCaseResponse = Either<ResourceNotFoundError, { order: Order }>

@Injectable()
export class CreateOrderUseCase {
  constructor(
    private ordersRepository: OrdersRepository,
    private clientsRepository: ClientsRepository,
    private productsRepository: ProductsRepository,
  ) {}

  async execute({ clientId, items, shippingCost, notes }: CreateOrderUseCaseRequest): Promise<CreateOrderUseCaseResponse> {
    const client = await this.clientsRepository.findById(clientId)
    if (!client) return left(new ResourceNotFoundError())

    const orderItems: OrderItem[] = []
    for (const item of items) {
      const product = await this.productsRepository.findById(item.productId)
      if (!product) return left(new ResourceNotFoundError())
      orderItems.push(
        OrderItem.create({
          productId: product.id.toString(),
          productCode: product.code,
          productName: product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice ?? product.price,
        }),
      )
    }

    const count = await this.ordersRepository.count()
    const orderCode = `PED-${String(count + 1).padStart(3, '0')}`

    const order = Order.create({
      orderCode,
      clientId: client.id.toString(),
      clientCode: client.code,
      clientName: client.name,
      clientEmail: client.email,
      clientPhone: client.phone,
      items: orderItems,
      shippingCost: shippingCost ?? 0,
      notes: notes ?? null,
    })

    await this.ordersRepository.create(order)
    return right({ order })
  }
}
```
  spec: seed a client + product in their in-memory repos; create order; assert orderCode `PED-001`, snapshots set, item.total + order.total computed; missing client/product → `ResourceNotFoundError`.
- [ ] `fetch-orders.ts` ({ filters } → `{ orders }`). spec: filter by status/clientName.
- [ ] `get-order-by-id.ts` (→ `{ order }` / `ResourceNotFoundError`).
- [ ] `edit-order.ts` ({ id, items?, shippingCost?, notes? }): load order (404 if missing); if `items` provided, re-resolve product snapshots (like create) and `order.items = newItems`; patch shippingCost/notes; `save`. → `{ order }`. spec: edit shippingCost; replace items.
- [ ] `change-order-status.ts` ({ id, status }): load (404), `order.status = status`, save → `{ order }`. spec: change to 'shipped'.
- [ ] Each spec FIRST → FAIL → impl → PASS. Commit `feat(backend): add order use-cases (create, fetch, by-id, edit, change-status) (TDD)`.

### Task 4: Orders Prisma + presenter + controllers
- [ ] Add `Order` + `OrderItem` models to `prisma/schema.prisma`:
```prisma
model Order {
  id           String    @id @default(uuid())
  orderCode    String    @unique @map("order_code")
  clientId     String?   @map("client_id")
  clientCode   String    @map("client_code")
  clientName   String    @map("client_name")
  clientEmail  String?   @map("client_email")
  clientPhone  String?   @map("client_phone")
  shippingCost Float     @default(0) @map("shipping_cost")
  status       String
  notes        String?
  createdAt    DateTime  @default(now()) @map("created_at")
  updatedAt    DateTime? @updatedAt @map("updated_at")

  items OrderItem[]

  @@index([status, updatedAt])
  @@map("orders")
}

model OrderItem {
  id          String  @id @default(uuid())
  orderId     String  @map("order_id")
  productId   String? @map("product_id")
  productCode String? @map("product_code")
  productName String  @map("product_name")
  quantity    Int
  unitPrice   Float   @map("unit_price")

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("order_items")
}
```
  `pnpm prisma generate`.
- [ ] `prisma-order-item-mapper.ts` (toDomain raw→OrderItem with UniqueEntityID; toPrisma returns the item columns incl. orderId).
- [ ] `prisma-order-mapper.ts` — `toDomain(raw, items)` builds Order with items array (cast status `as OrderStatus`); a separate `toPrismaOrder(order)` returns the order columns (no items).
- [ ] `prisma-orders-repository.ts`:
  - `findMany(filters)` → `prisma.order.findMany({ where, include: { items: true }, orderBy: { createdAt: 'desc' } })`; map each with items.
  - `findById` → `findUnique({ where:{id}, include:{items:true} })`.
  - `count` → `prisma.order.count()`.
  - `create(order)` → `prisma.order.create({ data: { ...orderColumns, items: { create: order.items.map(toItemCreate) } } })`.
  - `save(order)` → `prisma.$transaction([ prisma.order.update({ where:{id}, data: orderColumns }), prisma.orderItem.deleteMany({ where:{ orderId:id } }), prisma.orderItem.createMany({ data: order.items.map(i => ({ ...itemColumns, orderId:id })) }) ])`.
- [ ] Wire `OrdersRepository` in `database.module.ts`.
- [ ] `order-presenter.ts`:
```ts
static toHTTP(order: Order) {
  return {
    id: order.id.toString(),
    orderCode: order.orderCode,
    clientId: order.clientId ?? null,
    clientCode: order.clientCode,
    clientName: order.clientName,
    clientEmail: order.clientEmail ?? null,
    clientPhone: order.clientPhone ?? null,
    items: order.items.map((item) => ({
      id: item.id.toString(),
      productId: item.productId ?? null,
      productCode: item.productCode ?? null,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    })),
    shippingCost: order.shippingCost,
    total: order.total,
    status: order.status,
    notes: order.notes ?? null,
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt ? order.updatedAt.toISOString() : null,
  }
}
```
  NOTE: the frontend's `Order.id` is the friendly code (`PED-001`) in some places, but the migrated `features/orders/types.ts` uses a UUID-like `id` plus `clientCode`. Present `id` = UUID and include `orderCode` separately (frontend can map). Keep `orderCode` in the payload.
- [ ] Controllers (5): `fetch-orders` (GET /orders, Zod query {orderCode?,clientName?,status?}), `get-order-by-id` (GET /orders/:id), `create-order` (POST /orders, body `{clientId, items: [{productId, quantity, unitPrice?}], shippingCost?, notes?}`), `edit-order` (PATCH /orders/:id, body `{items?, shippingCost?, notes?}`), `change-order-status` (PATCH /orders/:id/status, body `{status: z.enum([...])}`). All `Left`→`NotFoundException`. Param-level body pipes. Register the literal-ish `/orders/:id/status` controller is fine (distinct sub-path). Register 5 controllers + 5 use-cases in `http.module.ts`.
- [ ] Commit `feat(backend): add orders endpoints (CRUD + status)`.

---

## PART 3 — BUDGETS (aggregate)

### Task 5: Budget + BudgetItem entities + repository + in-memory repo
- [ ] `budget-item.ts` — like OrderItem (productId?, productCode?, productName, quantity, unitPrice; computed total).
- [ ] `budget.ts` — `Entity<BudgetProps>` props `number, clientId, clientName, responsibleId, responsibleName, status:BudgetStatus, validityDate?:Date|null, items: BudgetItem[], createdAt, updatedAt?`. `BudgetStatus = 'pending'|'approved'|'rejected'|'expired'`. `get total()` = sum(items.total). setters for items/status/validityDate (touch updatedAt). `create` defaults status 'pending', items [], createdAt now.
- [ ] `budgets-repository.ts`:
```ts
export interface BudgetFilters {
  budgetNumber?: string
  clientId?: string
  responsibleId?: string
  status?: string
  startDate?: Date | null
  endDate?: Date | null
}
export abstract class BudgetsRepository {
  abstract findMany(filters: BudgetFilters): Promise<Budget[]>
  abstract findById(id: string): Promise<Budget | null>
  abstract count(): Promise<number>
  abstract create(budget: Budget): Promise<void>
  abstract save(budget: Budget): Promise<void>
  abstract delete(budget: Budget): Promise<void>
}
```
- [ ] `test/repositories/in-memory-budgets-repository.ts` (findMany: budgetNumber partial-ci against `number`, clientId exact, responsibleId exact, status exact, date range on createdAt; findById; count; create/save/delete).
- [ ] Commit `feat(backend): add Budget/BudgetItem entities, repository and in-memory repo`.

### Task 6: Budget use-cases (TDD)
- [ ] `create-budget.ts` — request `{ clientId, responsibleId, validityDate?, items: [{productId, quantity, unitPrice?}] }`. Resolve client (404), responsible representative... NOTE: `RepresentativesRepository` has no `findById` — ADD `findById(id): Promise<Representative | null>` to the abstract + in-memory + prisma repos (small extension). Resolve responsibleName from representative (404 if missing); resolve product snapshots. Generate `number = ORC-2025-${padded(count+1)}`. status 'pending'. → `{ budget }`. spec: snapshots + number ORC-2025-001 + computed total.
- [ ] `fetch-budgets.ts` ({filters} → {budgets}).
- [ ] `get-budget-by-id.ts` (→ {budget} / 404).
- [ ] `edit-budget.ts` ({ id, validityDate?, status?, items? }): load (404); re-resolve product snapshots if items provided; patch status/validityDate; save → {budget}.
- [ ] `delete-budget.ts` (404 if missing → right(null)).
- [ ] Each spec FIRST → FAIL → impl → PASS. Commit `feat(backend): add budget use-cases (create, fetch, by-id, edit, delete) (TDD)`.

### Task 7: Budgets Prisma + presenter + controllers; RepresentativesRepository.findById
- [ ] Extend `RepresentativesRepository` (+`findById`), its in-memory repo, and the prisma repo (`findUnique({where:{id}})`).
- [ ] Add `Budget` + `BudgetItem` models (mirror Order/OrderItem; Budget has `number @unique`, `clientId/clientName`, `responsibleId/responsibleName` mapped, `validityDate DateTime? @map`, `status`, items relation, `@@index([status, updatedAt])`, `@@map("budgets")`/`@@map("budget_items")`). `pnpm prisma generate`.
- [ ] `prisma-budget-item-mapper.ts`, `prisma-budget-mapper.ts`, `prisma-budgets-repository.ts` (mirror orders repo: include items; create with nested items; save transactional delete+createMany; delete).
- [ ] Wire `BudgetsRepository` in `database.module.ts`.
- [ ] `budget-presenter.ts` → `{ id, number, clientId, clientName, responsibleId, responsibleName, createdAt:iso, validityDate: x?iso:null, status, total, items: items.map(...) }`.
- [ ] Controllers (5): `fetch-budgets` (GET /budgets, Zod query {budgetNumber?,clientId?,responsibleId?,status?,startDate?,endDate?} with `z.coerce.date().optional()`), `get-budget-by-id` (GET /budgets/:id), `create-budget` (POST /budgets, body `{clientId, responsibleId, validityDate?, items:[{productId,quantity,unitPrice?}]}`), `edit-budget` (PATCH /budgets/:id, body `{status?, validityDate?, items?}`), `delete-budget` (DELETE /budgets/:id, 204). Param-level body pipes; `Left`→`NotFoundException`. Register 5 controllers + 5 use-cases in `http.module.ts`.
- [ ] Commit `feat(backend): add budgets endpoints (CRUD)`.

### Task 8: Seed + Gate
- [ ] (Optional) seed: a couple of orders + budgets referencing seeded clients/products/representatives.
- [ ] GATE: `pnpm prisma generate`; `pnpm test` (representatives 1+ + orders 5+ + budgets 5+ + existing 56 all pass); `pnpm build` → `dist/infra/main.js` exists. git clean.
- [ ] Commit `feat(backend): seed sample orders and budgets` (if seed extended).

---

## Done Criteria
- representatives (list + lookups), orders (CRUD + status, aggregate w/ snapshots), budgets (CRUD, aggregate w/ snapshots) — all with passing unit tests.
- Item/order/budget totals computed; items persisted transactionally; snapshots stored at create/edit.
- `pnpm test` + `pnpm build` + `pnpm prisma generate` pass.

## Next (F7/F8)
- **F7:** tickets (+messages, attachments) + priorities + tags (support context). **F8:** dashboard summary. **F9:** hardening. **F10:** frontend integration.
