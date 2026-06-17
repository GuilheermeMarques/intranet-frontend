import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { RefreshTokensRepository } from '@/domain/iam/application/repositories/refresh-tokens-repository'
import { RefreshToken } from '@/domain/iam/enterprise/entities/refresh-token'
import { PrismaRefreshTokenMapper } from '../mappers/prisma-refresh-token-mapper'

@Injectable()
export class PrismaRefreshTokensRepository implements RefreshTokensRepository {
  constructor(private prisma: PrismaService) {}

  async create(refreshToken: RefreshToken): Promise<void> {
    await this.prisma.refreshToken.create({ data: PrismaRefreshTokenMapper.toPrisma(refreshToken) })
  }

  async findByToken(token: string): Promise<RefreshToken | null> {
    const found = await this.prisma.refreshToken.findUnique({ where: { token } })
    return found ? PrismaRefreshTokenMapper.toDomain(found) : null
  }

  async save(refreshToken: RefreshToken): Promise<void> {
    const data = PrismaRefreshTokenMapper.toPrisma(refreshToken)
    await this.prisma.refreshToken.update({ where: { id: data.id as string }, data })
  }
}
