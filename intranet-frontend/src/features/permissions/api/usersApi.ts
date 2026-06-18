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
