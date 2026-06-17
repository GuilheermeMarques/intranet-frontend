import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { PreferencesRepository } from '../repositories/preferences-repository'
import { UserPreferences } from '../../enterprise/entities/user-preferences'

interface UpdatePreferencesUseCaseRequest {
  userId: string
  theme?: string
  language?: string
  sidebarCollapsed?: boolean
}

type UpdatePreferencesUseCaseResponse = Either<never, { preferences: UserPreferences }>

@Injectable()
export class UpdatePreferencesUseCase {
  constructor(private preferencesRepository: PreferencesRepository) {}

  async execute({ userId, theme, language, sidebarCollapsed }: UpdatePreferencesUseCaseRequest): Promise<UpdatePreferencesUseCaseResponse> {
    const preferences =
      (await this.preferencesRepository.findByUserId(userId)) ??
      UserPreferences.create({ userId: new UniqueEntityID(userId) })

    if (theme !== undefined) preferences.theme = theme
    if (language !== undefined) preferences.language = language
    if (sidebarCollapsed !== undefined) preferences.sidebarCollapsed = sidebarCollapsed

    await this.preferencesRepository.save(preferences)
    return right({ preferences })
  }
}
