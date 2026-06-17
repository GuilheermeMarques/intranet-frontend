import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { randomUUID } from 'node:crypto'
import { UsersRepository } from '../repositories/users-repository'
import { RefreshTokensRepository } from '../repositories/refresh-tokens-repository'
import { HashComparer } from '../cryptography/hash-comparer'
import { Encrypter } from '../cryptography/encrypter'
import { WrongCredentialsError } from './errors/wrong-credentials-error'
import { RefreshToken } from '../../enterprise/entities/refresh-token'
import { REFRESH_TOKEN_TTL_MS } from './refresh-token-ttl'

interface AuthenticateUseCaseRequest {
  email: string
  password: string
}

type AuthenticateUseCaseResponse = Either<
  WrongCredentialsError,
  { accessToken: string; refreshToken: string }
>

@Injectable()
export class AuthenticateUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
    private refreshTokensRepository: RefreshTokensRepository,
  ) {}

  async execute({ email, password }: AuthenticateUseCaseRequest): Promise<AuthenticateUseCaseResponse> {
    const user = await this.usersRepository.findByEmail(email)
    if (!user) return left(new WrongCredentialsError())

    const isPasswordValid = await this.hashComparer.compare(password, user.passwordHash)
    if (!isPasswordValid) return left(new WrongCredentialsError())

    const accessToken = await this.encrypter.encrypt({ sub: user.id.toString() })

    const refreshTokenValue = randomUUID()
    const refreshToken = RefreshToken.create({
      userId: user.id,
      token: refreshTokenValue,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    })
    await this.refreshTokensRepository.create(refreshToken)

    return right({ accessToken, refreshToken: refreshTokenValue })
  }
}
