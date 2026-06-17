import { UserPreferences } from '@/domain/iam/enterprise/entities/user-preferences'

export class PreferencesPresenter {
  static toHTTP(preferences: UserPreferences) {
    return {
      theme: preferences.theme,
      language: preferences.language,
      sidebarCollapsed: preferences.sidebarCollapsed,
    }
  }
}
