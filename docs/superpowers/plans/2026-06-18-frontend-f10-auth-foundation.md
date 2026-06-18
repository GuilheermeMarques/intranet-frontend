# Frontend F10 Phase 1 — Auth Foundation (BFF) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Replace NextAuth with the backend's native JWT auth, using a same-origin BFF: Next API routes set/clear httpOnly token cookies on login/logout; a catch-all proxy (`/api/backend/[...path]`) forwards browser requests to the backend with the bearer from the cookie and transparently refreshes on 401. The logged-in user's real `permissions[]` (from `GET /me`) drive menu visibility.

**Architecture:** Browser holds httpOnly cookies (`intranet_access_token`, `intranet_refresh_token`) — never readable by JS (the chosen secure option). Client code calls a thin `httpClient` whose baseURL is `/api/backend` (same origin → cookies auto-sent). The proxy route injects `Authorization: Bearer`, and on 401 calls `POST /sessions/refresh`, sets fresh cookies, and retries once. Login/logout are dedicated Next routes. This is Phase 1 of F10 (incremental cutover). **Phase 2** = swap each feature adapter mock→httpClient. **Phase 3** = permissions admin (users list / toggle) + remove mocks/deps remnants.

**Scope (Phase 1):** auth BFF + login/logout + `useMeQuery` + AccessControlContext `currentUser`/permissions from real `/me` + remove NextAuth + protective middleware. **Out of scope:** feature adapters (still mock), the user-management admin in AccessControlContext (`users`/`togglePermission`/`managedUser` stay mock until Phase 3).

**Tech Stack:** Next.js 15 App Router (route handlers), TanStack React Query, MUI. Backend at `http://localhost:3001/api/v1`.

**Working dir:** `intranet-frontend/`. Branch `feat/frontend-f10-auth`. Backend must be running for validation (`cd ../intranet-backend && docker compose up -d && pnpm start:dev`; admin `admin@empresa.com` / `admin123`).

---

## Task 1: Env + cookie/constants config

- [ ] Create `intranet-frontend/.env.local` (gitignored already via `.env`):
```
BACKEND_API_URL=http://localhost:3001/api/v1
```
- [ ] Create `src/services/authCookies.ts` (server-only constants + cookie options):
```ts
export const ACCESS_TOKEN_COOKIE = 'intranet_access_token'
export const REFRESH_TOKEN_COOKIE = 'intranet_refresh_token'

export const ACCESS_MAX_AGE = 60 * 15 // 15 min
export const REFRESH_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
  }
}

export const BACKEND_API_URL = process.env.BACKEND_API_URL ?? 'http://localhost:3001/api/v1'
```
- [ ] Commit `feat(frontend): add auth cookie config + BACKEND_API_URL env`.

## Task 2: Login + logout Next route handlers

- [ ] `src/app/api/auth/login/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
  cookieOptions,
  BACKEND_API_URL,
} from '@/services/authCookies'

export async function POST(request: NextRequest) {
  const { email, password } = await request.json()

  const res = await fetch(`${BACKEND_API_URL}/sessions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email, password }),
    cache: 'no-store',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({}))
    return NextResponse.json(
      { message: error.message ?? 'Credenciais inválidas.' },
      { status: res.status },
    )
  }

  const { accessToken, refreshToken } = await res.json()

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, cookieOptions(ACCESS_MAX_AGE))
  response.cookies.set(REFRESH_TOKEN_COOKIE, refreshToken, cookieOptions(REFRESH_MAX_AGE))
  return response
}
```
- [ ] `src/app/api/auth/logout/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  BACKEND_API_URL,
} from '@/services/authCookies'

export async function POST(request: NextRequest) {
  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

  if (refreshToken) {
    await fetch(`${BACKEND_API_URL}/sessions/logout`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    }).catch(() => undefined)
  }

  const response = new NextResponse(null, { status: 204 })
  response.cookies.delete(ACCESS_TOKEN_COOKIE)
  response.cookies.delete(REFRESH_TOKEN_COOKIE)
  return response
}
```
- [ ] Commit `feat(frontend): add login/logout BFF route handlers`.

## Task 3: Catch-all backend proxy (bearer injection + refresh-on-401)

- [ ] `src/app/api/backend/[...path]/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import {
  ACCESS_TOKEN_COOKIE,
  REFRESH_TOKEN_COOKIE,
  ACCESS_MAX_AGE,
  REFRESH_MAX_AGE,
  cookieOptions,
  BACKEND_API_URL,
} from '@/services/authCookies'

async function handler(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const { path } = await context.params
  const targetPath = path.join('/')
  const search = request.nextUrl.search
  const method = request.method
  const contentType = request.headers.get('content-type') ?? ''

  // Cache the body once so we can retry after a refresh.
  const hasBody = !['GET', 'HEAD'].includes(method)
  const bodyBuffer = hasBody ? Buffer.from(await request.arrayBuffer()) : undefined

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value

  async function call(token?: string) {
    const headers = new Headers()
    if (token) headers.set('authorization', `Bearer ${token}`)
    if (contentType) headers.set('content-type', contentType)
    return fetch(`${BACKEND_API_URL}/${targetPath}${search}`, {
      method,
      headers,
      body: bodyBuffer,
      cache: 'no-store',
    })
  }

  let res = await call(accessToken)
  let refreshed: { accessToken: string; refreshToken: string } | null = null

  if (res.status === 401 && refreshToken) {
    const refreshRes = await fetch(`${BACKEND_API_URL}/sessions/refresh`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
    })
    if (refreshRes.ok) {
      refreshed = await refreshRes.json()
      res = await call(refreshed!.accessToken)
    }
  }

  const responseBody = await res.arrayBuffer()
  const response = new NextResponse(responseBody, {
    status: res.status,
    headers: { 'content-type': res.headers.get('content-type') ?? 'application/json' },
  })

  if (refreshed) {
    response.cookies.set(ACCESS_TOKEN_COOKIE, refreshed.accessToken, cookieOptions(ACCESS_MAX_AGE))
    response.cookies.set(REFRESH_TOKEN_COOKIE, refreshed.refreshToken, cookieOptions(REFRESH_MAX_AGE))
  }

  return response
}

export {
  handler as GET,
  handler as POST,
  handler as PATCH,
  handler as PUT,
  handler as DELETE,
}
```
  (Forwarding the raw `arrayBuffer` + original `content-type` preserves multipart boundaries for future attachment uploads.)
- [ ] Commit `feat(frontend): add backend BFF proxy with refresh-on-401`.

## Task 4: httpClient + ApiError

- [ ] `src/services/httpClient.ts`:
```ts
export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message)
  }
}

const BASE = '/api/backend'

function toQuery(params?: Record<string, unknown>): string {
  if (!params) return ''
  const sp = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue
    sp.set(key, value instanceof Date ? value.toISOString() : String(value))
  }
  const qs = sp.toString()
  return qs ? `?${qs}` : ''
}

async function request<T>(method: string, path: string, opts: { params?: Record<string, unknown>; body?: unknown } = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}${toQuery(opts.params)}`, {
    method,
    headers: opts.body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  })

  if (res.status === 204) return undefined as T

  const text = await res.text()
  const data = text ? JSON.parse(text) : undefined

  if (!res.ok) {
    const message = (data && (data.message as string)) ?? `Request failed (${res.status})`
    throw new ApiError(res.status, message, data)
  }

  return data as T
}

export const httpClient = {
  get: <T>(path: string, params?: Record<string, unknown>) => request<T>('GET', path, { params }),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, { body }),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, { body }),
  put: <T>(path: string, body?: unknown) => request<T>('PUT', path, { body }),
  delete: <T>(path: string) => request<T>('DELETE', path),
}
```
- [ ] Commit `feat(frontend): add httpClient (same-origin BFF client)`.

## Task 5: Rewrite useAuth + add useMeQuery; remove NextAuth wiring

- [ ] Define the current-user shape `src/features/auth/types.ts`:
```ts
export interface CurrentUser {
  id: string
  name: string
  email: string
  jobTitle: string | null
  department: string | null
  avatar: string | null
  permissions: string[]
}
```
- [ ] `src/features/auth/hooks/useMeQuery.ts`:
```ts
import { useQuery } from '@tanstack/react-query'
import { httpClient } from '@/services/httpClient'
import type { CurrentUser } from '../types'

export function useMeQuery() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => httpClient.get<{ user: CurrentUser }>('/me').then((r) => r.user),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
```
- [ ] Rewrite `src/features/auth/hooks/useAuth.ts` (remove next-auth):
```ts
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message ?? 'Não foi possível realizar o login.')
      }
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      router.push('/home')
      router.refresh()
    },
    [router, queryClient],
  )

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    queryClient.clear()
    router.push('/login')
    router.refresh()
  }, [router, queryClient])

  return { login, logout }
}
```
- [ ] Update `src/app/login/page.tsx`: the `onSubmit` already calls `login(email, password)` — keep it. Remove any `CredentialsSignin` special-casing (the thrown error message is now the backend's). Ensure no other next-auth imports remain in this file.
- [ ] Remove the NextAuth SessionProvider from `src/app/layout.tsx` (delete the `<SessionProvider>` wrapper + its import). Keep `QueryProvider` / `AccessControlProvider` / `ThemeProvider`.
- [ ] `npm run type-check` — expect errors only in files still importing next-auth (handled in Task 7). Commit `feat(frontend): rewire useAuth to backend JWT (BFF); add useMeQuery`.

## Task 6: AccessControlContext currentUser from real /me

The context currently derives `currentUser` from the mock `users[sessionUserId]`. Phase-1 change: make `currentUser` come from `useMeQuery`. Keep the mock-backed `users`/`togglePermission`/`managedUser` admin parts UNCHANGED (Phase 3 wires them).

- [ ] In `src/contexts/AccessControlContext.tsx`:
  - Import `useMeQuery` and map its data to the `AccessControlUser` shape used by the context (id, name, email, jobTitle, department, status:'active', lastLogin:'', avatar, permissions). Replace the `currentUser` derivation (which used `sessionUserId`/mock) with: `const { data: me } = useMeQuery(); const currentUser = me ? { id: me.id, name: me.name, email: me.email, jobTitle: me.jobTitle ?? '', department: me.department ?? '', status: 'active', lastLogin: '', avatar: me.avatar ?? '', permissions: me.permissions } : null`.
  - Drive `visibleMenuItems`, `canManagePermissions`, and `hasPermission(...)` off this real `currentUser.permissions` (they already do via `currentUser?.permissions ?? []` — just ensure they read the new `currentUser`).
  - Set `isReady` true once `me` has loaded (or keep existing localStorage-ready logic but also gate on `me`).
  - Leave `users`, `sessionUserId`, `managedUserId`, `togglePermission`, `selectManagedUser`, `resetMockData` as-is (still mock — used only by the settings/permissions admin screen, Phase 3).
- [ ] `npm run type-check` for this file → no new errors. Commit `feat(frontend): drive AccessControl currentUser/permissions from real /me`.

## Task 7: Protective middleware + remove NextAuth files/deps

- [ ] Create `src/middleware.ts` (redirect unauthenticated to /login):
```ts
import { NextRequest, NextResponse } from 'next/server'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/services/authCookies'

const PUBLIC_PATHS = ['/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession =
    request.cookies.has(ACCESS_TOKEN_COOKIE) || request.cookies.has(REFRESH_TOKEN_COOKIE)

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (hasSession) return NextResponse.redirect(new URL('/home', request.url))
    return NextResponse.next()
  }

  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```
- [ ] Delete NextAuth files: `src/app/api/auth/[...nextauth]/` (whole dir), `src/infrastructure/auth/authConfig.ts`, `src/app/providers/SessionProvider.tsx`.
- [ ] Verify nothing imports them: `grep -rn "next-auth\|authConfig\|SessionProvider\|@/infrastructure/auth" src` → only allowable leftover would be none. Fix any stragglers.
- [ ] Remove deps: `npm uninstall next-auth @auth/core @auth/prisma-adapter jsonwebtoken @types/jsonwebtoken bcryptjs @types/bcryptjs express-rate-limit`.
- [ ] `npm run type-check && npm run lint && npm run build` → all green.
- [ ] Commit `chore(frontend): remove NextAuth (replaced by BFF JWT) + add auth middleware`.

## Task 8: Validate end-to-end (backend running)

**[needs backend]** From `intranet-backend/`: `docker compose up -d && pnpm start:dev` (admin seeded). From `intranet-frontend/`: `npm run dev` (port 3000). Then:
- [ ] `curl -i -c /tmp/cj -X POST localhost:3000/api/auth/login -H 'content-type: application/json' -d '{"email":"admin@empresa.com","password":"admin123"}'` → 200, `Set-Cookie` for both tokens.
- [ ] `curl -s -b /tmp/cj localhost:3000/api/backend/me` → `{"user":{...,"permissions":[13 keys]}}`.
- [ ] `curl -s -b /tmp/cj localhost:3000/api/backend/clients` → `{clients:[...],cities:[...]}` (proxied, authed).
- [ ] `curl -s localhost:3000/api/backend/me` (no cookie) → 401.
- [ ] `curl -i -b /tmp/cj -X POST localhost:3000/api/auth/logout` → 204 + cookies cleared.
- [ ] Document results.

---

## Done Criteria
- Login sets httpOnly cookies via the backend; `/api/backend/*` proxies authed requests with transparent refresh; logout clears cookies + revokes refresh.
- `useMeQuery` + AccessControlContext expose the real logged-in user's `permissions[]` (menu driven by them).
- NextAuth fully removed; `npm run build` + `type-check` + `lint` green.

## Next (F10 Phase 2 / 3)
- **Phase 2:** swap each feature adapter (`features/<domain>/api/*Api.ts`) from mock reads to `httpClient` calls (clients, products, inventory, representatives, orders, budgets, tickets, priorities, tags, dashboard).
- **Phase 3:** wire the `/settings/permissions` admin (GET /users, PUT /users/:id/permissions) + preferences via API; remove `src/mocks/*` and `@/types/accessControl` legacy.
