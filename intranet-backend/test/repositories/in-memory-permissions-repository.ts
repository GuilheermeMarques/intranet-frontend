import { PermissionsRepository } from '@/domain/iam/application/repositories/permissions-repository'
import { Permission } from '@/domain/iam/enterprise/entities/permission'

export class InMemoryPermissionsRepository implements PermissionsRepository {
  public catalog: Permission[] = []
  public assignments: { userId: string; key: string }[] = []

  async findManyCatalog() {
    return [...this.catalog]
  }

  async findKeysByUserId(userId: string) {
    return this.assignments.filter((a) => a.userId === userId).map((a) => a.key)
  }

  async replaceUserPermissions(userId: string, permissionKeys: string[]) {
    this.assignments = this.assignments.filter((a) => a.userId !== userId)
    for (const key of permissionKeys) {
      this.assignments.push({ userId, key })
    }
  }
}
