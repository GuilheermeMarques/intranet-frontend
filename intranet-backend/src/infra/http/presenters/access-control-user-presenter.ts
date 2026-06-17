import { User } from '@/domain/iam/enterprise/entities/user'

export class AccessControlUserPresenter {
  static toHTTP(user: User, permissions: string[]) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      jobTitle: user.jobTitle ?? null,
      department: user.department ?? null,
      status: user.isActive ? 'active' : 'inactive',
      lastLogin: user.lastLoginAt ? user.lastLoginAt.toISOString() : null,
      avatar: user.avatar ?? null,
      permissions,
    }
  }
}
