import { faker } from '@faker-js/faker'
import { Injectable } from '@nestjs/common'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, UserProps } from '@/domain/iam/enterprise/entities/user'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { PrismaUserMapper } from '@/infra/database/prisma/mappers/prisma-user-mapper'

export function makeUser(override: Partial<UserProps> = {}, id?: UniqueEntityID) {
  return User.create(
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      passwordHash: faker.internet.password(),
      isActive: true,
      ...override,
    },
    id,
  )
}

@Injectable()
export class UserFactory {
  constructor(private prisma: PrismaService) {}

  async makePrismaUser(data: Partial<UserProps> = {}): Promise<User> {
    const user = makeUser(data)
    await this.prisma.user.create({ data: PrismaUserMapper.toPrisma(user) })
    return user
  }
}
