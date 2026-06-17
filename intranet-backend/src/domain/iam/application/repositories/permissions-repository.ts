import { Permission } from '../../enterprise/entities/permission'

export abstract class PermissionsRepository {
  abstract findManyCatalog(): Promise<Permission[]>
  abstract findKeysByUserId(userId: string): Promise<string[]>
  abstract replaceUserPermissions(userId: string, permissionKeys: string[]): Promise<void>
}
