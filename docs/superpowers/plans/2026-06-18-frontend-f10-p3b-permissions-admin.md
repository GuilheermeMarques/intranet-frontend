# Frontend F10 Phase 3b — Permissions Admin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Wire the `/settings/permissions` admin to the real backend — the users list comes from `GET /users` and permission toggles persist via `PUT /users/:id/permissions`. This removes the last mock/localStorage from the auth/permissions story (completing the deferred piece).

**Architecture:** A new `features/permissions` module (`usersApi` + `useUsersQuery` + `useSetUserPermissionsMutation`). `AccessControlContext` keeps its EXACT public interface (the settings page is unchanged) but swaps its implementation: `users` ← `useUsersQuery` (enabled only when the current user can manage), `togglePermission` ← mutation (computing the new set with the existing `applyPermissionToggle` cascade + self-protection), `resetMockData` ← query refetch, drop the mock clone + localStorage.

**Backend:** `GET /users` → `{users: AccessControlUser[]}` (requires `settings.permissions.manage`); `PUT /users/:id/permissions` `{permissions:string[]}` → `{permissions}`. `AccessControlUser = {id,name,email,jobTitle,department,status,lastLogin,avatar,permissions}` (backend nulls coerced to '' in the adapter).

**Tech Stack:** Next.js 15, TanStack React Query. npm. Backend running.

**Working dir:** `intranet-frontend/`. Branch `feat/frontend-f10-p3b-permissions`. Gate: `npm test` + `npm run build`. Keep the dev server STOPPED while building.

---

## Task 1: users adapter + query/mutation hooks
- [ ] `src/features/permissions/api/usersApi.ts`:
```ts
import { httpClient } from '@/services/httpClient'
import type { AccessControlUser } from '@/types/accessControl'

interface BackendUser {
  id: string
  name: string
  email: string
  jobTitle: string | null
  department: string | null
  status: 'active' | 'inactive'
  lastLogin: string | null
  avatar: string | null
  permissions: string[]
}

function toAccessControlUser(u: BackendUser): AccessControlUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    jobTitle: u.jobTitle ?? '',
    department: u.department ?? '',
    status: u.status,
    lastLogin: u.lastLogin ?? '',
    avatar: u.avatar ?? '',
    permissions: u.permissions,
  }
}

export const usersApi = {
  async list(): Promise<AccessControlUser[]> {
    const { users } = await httpClient.get<{ users: BackendUser[] }>('/users')
    return users.map(toAccessControlUser)
  },
  async setPermissions(userId: string, permissions: string[]): Promise<string[]> {
    const res = await httpClient.put<{ permissions: string[] }>(`/users/${userId}/permissions`, { permissions })
    return res.permissions
  },
}
```
- [ ] `src/features/permissions/hooks/useUsersQuery.ts`:
```ts
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '../api/usersApi'

export function useUsersQuery(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
    enabled: options?.enabled ?? true,
  })
}
```
- [ ] `src/features/permissions/hooks/useSetUserPermissionsMutation.ts`:
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/usersApi'

export function useSetUserPermissionsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, permissions }: { userId: string; permissions: string[] }) =>
      usersApi.setPermissions(userId, permissions),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
  })
}
```
- [ ] `src/features/permissions/api/usersApi.test.ts`: mock httpClient; assert `list()` GETs `/users`, unwraps `.users`, coerces nulls→''; `setPermissions()` PUTs `/users/:id/permissions` with `{permissions}` and returns `.permissions`.
- [ ] Commit `feat(frontend): add users/permissions adapter + hooks`.

## Task 2: AccessControlContext → real users + mutation
READ the whole `src/contexts/AccessControlContext.tsx` first. Keep the EXACT `AccessControlContextValue` interface + the `useAccessControl` export. Change only the implementation:

- [ ] Remove: the `@/mocks/access-control.json` import, `cloneMockUsers`, the `USERS_STORAGE_KEY`/`SESSION_USER_STORAGE_KEY`/`MANAGED_USER_STORAGE_KEY` constants, the `users` `useState`, the `sessionUserId` `useState`, and BOTH `useEffect`s (the localStorage load + persist). Keep `useMeQuery` + `currentUser` (Phase 1).
- [ ] Add imports: `useUsersQuery`, `useSetUserPermissionsMutation`.
- [ ] New state/data:
```tsx
const { data: me } = useMeQuery()
const currentUser = /* unchanged useMemo from me */
const canManagePermissions = hasPermission(currentUser?.permissions ?? [], MANAGE_PERMISSIONS_KEY)

const { data: usersData, isLoading: usersLoading } = useUsersQuery({ enabled: canManagePermissions })
const users = useMemo(() => usersData ?? [], [usersData])

const [managedUserId, setManagedUserId] = useState<string | null>(null)
useEffect(() => {
  if (!managedUserId && currentUser) setManagedUserId(currentUser.id)
}, [managedUserId, currentUser])

const setPermissionsMutation = useSetUserPermissionsMutation()
const queryClient = useQueryClient() // for resetMockData -> refetch
```
- [ ] `managedUser` = `users.find(u => u.id === managedUserId) ?? users[0] ?? currentUser ?? null` (so the admin can manage themselves even before the list resolves).
- [ ] `togglePermission(userId, permissionKey, enabled)`:
```tsx
const togglePermission = (userId: string, permissionKey: string, enabled: boolean) => {
  if (!canManagePermissions) return
  const user = users.find((u) => u.id === userId) ?? (currentUser?.id === userId ? currentUser : undefined)
  if (!user) return
  // self can't remove its own manage permission
  if (userId === currentUser?.id && permissionKey === MANAGE_PERMISSIONS_KEY && enabled === false) return
  const permissions = applyPermissionToggle(user.permissions, permissionKey, enabled)
  setPermissionsMutation.mutate({ userId, permissions })
}
```
- [ ] `selectManagedUser(userId)` → `setManagedUserId(userId)` (unchanged).
- [ ] `resetMockData` → refetch users: `() => queryClient.invalidateQueries({ queryKey: ['users'] })` (the settings page's "Refresh" button — keep the name to avoid changing the page).
- [ ] Provider value: `sessionUserId: currentUser?.id ?? null`, `users`, `managedUser`, `managedUserId`, `isReady: Boolean(me)`, everything else as before (administrativePermissions, allPermissionKeys, menuItems, visibleMenuItems, canManagePermissions, getVisibleMenuItemsForUser, hasPermission).
- [ ] Verify: `grep -n "@/mocks\|localStorage\|cloneMockUsers\|STORAGE_KEY" src/contexts/AccessControlContext.tsx` → empty. `npx tsc --noEmit 2>&1 | grep "AccessControlContext"` → zero.
- [ ] Commit `feat(frontend): wire AccessControl users + togglePermission to the API`.

## Task 3: Gate
- [ ] `npm run type-check` (only pre-existing test-matcher noise); `npm test -- --watchAll=false` (green); `npm run lint` (no new errors); `npm run build` (SUCCESS — keep dev server stopped).
- [ ] `grep -rn "@/mocks/access-control" src` → empty (the context no longer reads it).
- [ ] Commit any straggler.

---

## Done Criteria
- `/settings/permissions` lists real users (GET /users) and persists toggles (PUT /users/:id/permissions); the menu/nav reflects the change after invalidation (current user's /me also refetched).
- `AccessControlContext` reads no mock/localStorage; public interface unchanged (settings page untouched).
- `npm test` + `npm run build` green.
- (Controller validates via BFF: GET /api/backend/users, PUT /api/backend/users/:id/permissions, and that a non-manage 403 is handled — the query is disabled then.)

## Next (Phase 3c)
- create/edit flows for clients/products/orders/budgets/inventory/tickets (+ messages, drag status); preferences via API; remove `src/mocks/*` + legacy types/utils that still read mocks (theme.json, settings.json).
