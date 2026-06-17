import { Permission } from '@/domain/iam/enterprise/entities/permission'

export class PermissionPresenter {
  static toHTTP(permission: Permission) {
    return {
      key: permission.key,
      name: permission.name,
      description: permission.description ?? null,
      category: permission.category ?? null,
    }
  }
}
