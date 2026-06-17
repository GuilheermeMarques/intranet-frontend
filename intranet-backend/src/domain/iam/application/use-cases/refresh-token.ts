import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { RefreshTokensRepository } from '../repositories/refresh-tokens-repository'
import { Encrypter } from '../cryptography/encrypter'
import { RefreshToken } from '../../enterprise/entities/refresh-token'
import { InvalidRefreshTokenError } from './errors/invalid-refresh-token-error'
import { REFRESH_TOKEN_TTL_MS } from './refresh-token-ttl'

interface RefreshTokenUseCaseRequest {
  refreshToken: string
}

type RefreshTokenUseCaseResponse = Either<
  InvalidRefreshTokenError,
  { accessToken: string; refreshToken: string }
>

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    private refreshTokensRepository: RefreshTokensRepository,
    private encrypter: Encrypter,
  ) {}

  async execute({ refreshToken }: RefreshTokenUseCaseRequest): Promise<RefreshTokenUseCaseResponse> {
    const stored = await this.refreshTokensRepository.findByToken(refreshToken)
    if (!stored || !stored.isValid) return left(new InvalidRefreshTokenError())

    stored.revoke()
    await this.refreshTokensRepository.save(stored)

    const newTokenValue = randomUUID()
    const rotated = RefreshToken.create({
      userId: stored.userId,
      token: newTokenValue,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    })
    await this.refreshTokensRepository.create(rotated)

    const accessToken = await this.encrypter.encrypt({ sub: stored.userId.toString() })

    return right({ accessToken, refreshToken: newTokenValue })
  }
}
