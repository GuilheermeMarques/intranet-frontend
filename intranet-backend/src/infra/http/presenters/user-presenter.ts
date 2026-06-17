import { User } from '@/domain/iam/enterprise/entities/user'

export class UserPresenter {
  static toHTTP(user: User, permissions: string[]) {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      jobTitle: user.jobTitle ?? null,
      department: user.department ?? null,
      avatar: user.avatar ?? null,
      permissions,
    }
  }
}
