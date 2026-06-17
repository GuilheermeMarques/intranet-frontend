import { InMemoryPreferencesRepository } from 'test/repositories/in-memory-preferences-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { UserPreferences } from '@/domain/iam/enterprise/entities/user-preferences'
import { GetPreferencesUseCase } from './get-preferences'

let repo: InMemoryPreferencesRepository
let sut: GetPreferencesUseCase

describe('Get Preferences', () => {
  beforeEach(() => {
    repo = new InMemoryPreferencesRepository()
    sut = new GetPreferencesUseCase(repo)
  })

  it('returns stored preferences', async () => {
    repo.items.push(UserPreferences.create({ userId: new UniqueEntityID('u1'), theme: 'dark', language: 'en', sidebarCollapsed: true }))
    const result = await sut.execute({ userId: 'u1' })
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.preferences.theme).toBe('dark')
      expect(result.value.preferences.sidebarCollapsed).toBe(true)
    }
  })

  it('returns defaults when none exist', async () => {
    const result = await sut.execute({ userId: 'u2' })
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.preferences.theme).toBe('light')
      expect(result.value.preferences.language).toBe('pt-BR')
      expect(result.value.preferences.sidebarCollapsed).toBe(false)
    }
  })
})
