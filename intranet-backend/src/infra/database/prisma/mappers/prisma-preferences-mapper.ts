import { UserPreferences as PrismaUserPreferences } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserPreferences } from '@/domain/iam/enterprise/entities/user-preferences'

export class PrismaPreferencesMapper {
  static toDomain(raw: PrismaUserPreferences): UserPreferences {
    return UserPreferences.create(
      {
        userId: new UniqueEntityID(raw.userId),
        theme: raw.theme,
        language: raw.language,
        sidebarCollapsed: raw.sidebarCollapsed,
      },
      new UniqueEntityID(raw.id),
    )
  }
}
