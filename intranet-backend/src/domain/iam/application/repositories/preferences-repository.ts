import { UserPreferences } from '../../enterprise/entities/user-preferences'

export abstract class PreferencesRepository {
  abstract findByUserId(userId: string): Promise<UserPreferences | null>
  abstract save(preferences: UserPreferences): Promise<void>
}
