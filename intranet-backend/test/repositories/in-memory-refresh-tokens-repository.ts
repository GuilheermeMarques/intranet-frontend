import { RefreshTokensRepository } from '@/domain/iam/application/repositories/refresh-tokens-repository'
import { RefreshToken } from '@/domain/iam/enterprise/entities/refresh-token'

export class InMemoryRefreshTokensRepository implements RefreshTokensRepository {
  public items: RefreshToken[] = []

  async create(refreshToken: RefreshToken) {
    this.items.push(refreshToken)
  }

  async findByToken(token: string) {
    return this.items.find((item) => item.token === token) ?? null
  }

  async save(refreshToken: RefreshToken) {
    const index = this.items.findIndex((item) => item.id.equals(refreshToken.id))
    if (index >= 0) this.items[index] = refreshToken
  }
}
