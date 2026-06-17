import { InMemoryRefreshTokensRepository } from 'test/repositories/in-memory-refresh-tokens-repository'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { RefreshToken } from '@/domain/iam/enterprise/entities/refresh-token'
import { RefreshTokenUseCase } from './refresh-token'
import { InvalidRefreshTokenError } from './errors/invalid-refresh-token-error'

let inMemoryRefreshTokensRepository: InMemoryRefreshTokensRepository
let encrypter: FakeEncrypter
let sut: RefreshTokenUseCase

function makeRefreshToken(token: string, overrides: Partial<{ expiresAt: Date; revokedAt: Date | null }> = {}) {
  return RefreshToken.create({
    userId: new UniqueEntityID('user-1'),
    token,
    expiresAt: overrides.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60),
    revokedAt: overrides.revokedAt ?? null,
  })
}

describe('Refresh Token', () => {
  beforeEach(() => {
    inMemoryRefreshTokensRepository = new InMemoryRefreshTokensRepository()
    encrypter = new FakeEncrypter()
    sut = new RefreshTokenUseCase(inMemoryRefreshTokensRepository, encrypter)
  })

  it('rotates a valid refresh token into a new token pair', async () => {
    inMemoryRefreshTokensRepository.items.push(makeRefreshToken('valid-token'))

    const result = await sut.execute({ refreshToken: 'valid-token' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      })
      expect(result.value.refreshToken).not.toBe('valid-token')
    }
    // old token revoked, new token persisted
    const old = await inMemoryRefreshTokensRepository.findByToken('valid-token')
    expect(old?.isRevoked).toBe(true)
    expect(inMemoryRefreshTokensRepository.items).toHaveLength(2)
  })

  it('rejects an unknown refresh token', async () => {
    const result = await sut.execute({ refreshToken: 'nope' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })

  it('rejects a revoked refresh token', async () => {
    inMemoryRefreshTokensRepository.items.push(makeRefreshToken('revoked', { revokedAt: new Date() }))
    const result = await sut.execute({ refreshToken: 'revoked' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })

  it('rejects an expired refresh token', async () => {
    inMemoryRefreshTokensRepository.items.push(makeRefreshToken('expired', { expiresAt: new Date(Date.now() - 1000) }))
    const result = await sut.execute({ refreshToken: 'expired' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(InvalidRefreshTokenError)
  })
})
