import { RefreshToken } from '../../enterprise/entities/refresh-token'

export abstract class RefreshTokensRepository {
  abstract create(refreshToken: RefreshToken): Promise<void>
  abstract findByToken(token: string): Promise<RefreshToken | null>
  abstract save(refreshToken: RefreshToken): Promise<void>
}
