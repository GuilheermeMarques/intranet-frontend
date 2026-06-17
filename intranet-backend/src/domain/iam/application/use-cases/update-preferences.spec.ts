import { InMemoryPreferencesRepository } from 'test/repositories/in-memory-preferences-repository'
import { UpdatePreferencesUseCase } from './update-preferences'

let repo: InMemoryPreferencesRepository
let sut: UpdatePreferencesUseCase

describe('Update Preferences', () => {
  beforeEach(() => {
    repo = new InMemoryPreferencesRepository()
    sut = new UpdatePreferencesUseCase(repo)
  })

  it('creates and persists preferences when none exist', async () => {
    const result = await sut.execute({ userId: 'u1', theme: 'dark' })
    expect(result.isRight()).toBe(true)
    if (result.isRight()) expect(result.value.preferences.theme).toBe('dark')
    expect(repo.items).toHaveLength(1)
    const stored = await repo.findByUserId('u1')
    expect(stored?.theme).toBe('dark')
  })

  it('patches only provided fields', async () => {
    await sut.execute({ userId: 'u1', theme: 'dark', language: 'en', sidebarCollapsed: true })
    const result = await sut.execute({ userId: 'u1', sidebarCollapsed: false })
    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.preferences.theme).toBe('dark') // unchanged
      expect(result.value.preferences.language).toBe('en') // unchanged
      expect(result.value.preferences.sidebarCollapsed).toBe(false) // patched
    }
    expect(repo.items).toHaveLength(1)
  })
})
