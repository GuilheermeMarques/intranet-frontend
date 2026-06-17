import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { RefreshTokensRepository } from '../repositories/refresh-tokens-repository'

interface LogoutUseCaseRequest {
  refreshToken: string
}

type LogoutUseCaseResponse = Either<never, null>

@Injectable()
export class LogoutUseCase {
  constructor(private refreshTokensRepository: RefreshTokensRepository) {}

  async execute({ refreshToken }: LogoutUseCaseRequest): Promise<LogoutUseCaseResponse> {
    const stored = await this.refreshTokensRepository.findByToken(refreshToken)
    if (stored && !stored.isRevoked) {
      stored.revoke()
      await this.refreshTokensRepository.save(stored)
    }
    return right(null)
  }
}
