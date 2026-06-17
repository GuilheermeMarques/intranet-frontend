import { Entity } from '@/core/entities/entity'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Optional } from '@/core/types/optional'

export interface UserPreferencesProps {
  userId: UniqueEntityID
  theme: string
  language: string
  sidebarCollapsed: boolean
}

export class UserPreferences extends Entity<UserPreferencesProps> {
  get userId() { return this.props.userId }
  get theme() { return this.props.theme }
  get language() { return this.props.language }
  get sidebarCollapsed() { return this.props.sidebarCollapsed }

  set theme(value: string) { this.props.theme = value }
  set language(value: string) { this.props.language = value }
  set sidebarCollapsed(value: boolean) { this.props.sidebarCollapsed = value }

  static create(
    props: Optional<UserPreferencesProps, 'theme' | 'language' | 'sidebarCollapsed'>,
    id?: UniqueEntityID,
  ) {
    return new UserPreferences(
      {
        ...props,
        theme: props.theme ?? 'light',
        language: props.language ?? 'pt-BR',
        sidebarCollapsed: props.sidebarCollapsed ?? false,
      },
      id,
    )
  }
}
