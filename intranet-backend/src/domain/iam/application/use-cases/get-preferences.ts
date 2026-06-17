import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { PreferencesRepository } from '../repositories/preferences-repository'
import { UserPreferences } from '../../enterprise/entities/user-preferences'

interface GetPreferencesUseCaseRequest { userId: string }
type GetPreferencesUseCaseResponse = Either<never, { preferences: UserPreferences }>

@Injectable()
export class GetPreferencesUseCase {
  constructor(private preferencesRepository: PreferencesRepository) {}

  async execute({ userId }: GetPreferencesUseCaseRequest): Promise<GetPreferencesUseCaseResponse> {
    const existing = await this.preferencesRepository.findByUserId(userId)
    const preferences = existing ?? UserPreferences.create({ userId: new UniqueEntityID(userId) })
    return right({ preferences })
  }
}
