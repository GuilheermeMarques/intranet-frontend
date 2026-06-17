import { User as PrismaUser, Prisma } from '@prisma/client'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User } from '@/domain/iam/enterprise/entities/user'

export class PrismaUserMapper {
  static toDomain(raw: PrismaUser): User {
    return User.create(
      {
        name: raw.name,
        email: raw.email,
        passwordHash: raw.passwordHash,
        isActive: raw.isActive,
        avatar: raw.avatar,
        jobTitle: raw.jobTitle,
        department: raw.department,
        lastLoginAt: raw.lastLoginAt,
      },
      new UniqueEntityID(raw.id),
    )
  }

  static toPrisma(user: User): Prisma.UserUncheckedCreateInput {
    return {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      isActive: user.isActive,
      avatar: user.avatar ?? null,
      jobTitle: user.jobTitle ?? null,
      department: user.department ?? null,
      lastLoginAt: user.lastLoginAt ?? null,
    }
  }
}
