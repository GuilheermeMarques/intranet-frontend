import { InMemoryRefreshTokensRepository } from 'test/repositories/in-memory-refresh-tokens-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { RefreshToken } from '@/domain/iam/enterprise/entities/refresh-token'
import { LogoutUseCase } from './logout'

let inMemoryRefreshTokensRepository: InMemoryRefreshTokensRepository
let sut: LogoutUseCase

describe('Logout', () => {
  beforeEach(() => {
    inMemoryRefreshTokensRepository = new InMemoryRefreshTokensRepository()
    sut = new LogoutUseCase(inMemoryRefreshTokensRepository)
  })

  it('revokes the given refresh token', async () => {
    inMemoryRefreshTokensRepository.items.push(
      RefreshToken.create({
        userId: new UniqueEntityID('user-1'),
        token: 'tok',
        expiresAt: new Date(Date.now() + 1000 * 60),
      }),
    )

    const result = await sut.execute({ refreshToken: 'tok' })

    expect(result.isRight()).toBe(true)
    const stored = await inMemoryRefreshTokensRepository.findByToken('tok')
    expect(stored?.isRevoked).toBe(true)
  })

  it('is idempotent for an unknown token', async () => {
    const result = await sut.execute({ refreshToken: 'missing' })
    expect(result.isRight()).toBe(true)
  })
})
