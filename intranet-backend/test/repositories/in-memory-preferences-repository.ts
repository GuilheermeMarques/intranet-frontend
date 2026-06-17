import { PreferencesRepository } from '@/domain/iam/application/repositories/preferences-repository'
import { UserPreferences } from '@/domain/iam/enterprise/entities/user-preferences'

export class InMemoryPreferencesRepository implements PreferencesRepository {
  public items: UserPreferences[] = []

  async findByUserId(userId: string) {
    return this.items.find((item) => item.userId.toString() === userId) ?? null
  }

  async save(preferences: UserPreferences) {
    const index = this.items.findIndex((item) => item.userId.toString() === preferences.userId.toString())
    if (index >= 0) this.items[index] = preferences
    else this.items.push(preferences)
  }
}
