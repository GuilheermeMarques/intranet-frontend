import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { PreferencesRepository } from '@/domain/iam/application/repositories/preferences-repository'
import { UserPreferences } from '@/domain/iam/enterprise/entities/user-preferences'
import { PrismaPreferencesMapper } from '../mappers/prisma-preferences-mapper'

@Injectable()
export class PrismaPreferencesRepository implements PreferencesRepository {
  constructor(private prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserPreferences | null> {
    const found = await this.prisma.userPreferences.findUnique({ where: { userId } })
    return found ? PrismaPreferencesMapper.toDomain(found) : null
  }

  async save(preferences: UserPreferences): Promise<void> {
    const userId = preferences.userId.toString()
    await this.prisma.userPreferences.upsert({
      where: { userId },
      update: {
        theme: preferences.theme,
        language: preferences.language,
        sidebarCollapsed: preferences.sidebarCollapsed,
      },
      create: {
        userId,
        theme: preferences.theme,
        language: preferences.language,
        sidebarCollapsed: preferences.sidebarCollapsed,
      },
    })
  }
}
