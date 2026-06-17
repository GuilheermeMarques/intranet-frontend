import { RefreshToken as PrismaRefreshToken, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { RefreshToken } from '@/domain/iam/enterprise/entities/refresh-token'

export class PrismaRefreshTokenMapper {
  static toDomain(raw: PrismaRefreshToken): RefreshToken {
    return RefreshToken.create(
      {
        userId: new UniqueEntityID(raw.userId),
        token: raw.token,
        expiresAt: raw.expiresAt,
        revokedAt: raw.revokedAt,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(refreshToken: RefreshToken): Prisma.RefreshTokenUncheckedCreateInput {
    return {
      id: refreshToken.id.toString(),
      token: refreshToken.token,
      userId: refreshToken.userId.toString(),
      expiresAt: refreshToken.expiresAt,
      revokedAt: refreshToken.revokedAt ?? null,
      createdAt: refreshToken.createdAt,
    }
  }
}
