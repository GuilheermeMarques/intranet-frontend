import { Permission as PrismaPermission } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Permission } from '@/domain/iam/enterprise/entities/permission'

export class PrismaPermissionMapper {
  static toDomain(raw: PrismaPermission): Permission {
    return Permission.create(
      { key: raw.key, name: raw.name, description: raw.description, category: raw.category },
      new UniqueEntityID(raw.id),
    )
  }
}
