import { faker } from '@faker-js/faker'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { User, UserProps } from '@/domain/iam/enterprise/entities/user'

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

// TODO(F2 Task 5 / next dispatch): re-add the `UserFactory` class here once
// `PrismaUserMapper` (src/infra/database/prisma/mappers/prisma-user-mapper.ts)
// exists. It was deferred to keep the unit spec green — importing the
// not-yet-created mapper at module top breaks `authenticate.spec.ts`'s import
// chain (which imports `makeUser`). The e2e spec (also a later dispatch)
// consumes `UserFactory`. Reference implementation from the plan:
//
//   import { Injectable } from '@nestjs/common'
//   import { PrismaService } from '@/infra/database/prisma/prisma.service'
//   import { PrismaUserMapper } from '@/infra/database/prisma/mappers/prisma-user-mapper'
//
//   @Injectable()
//   export class UserFactory {
//     constructor(private prisma: PrismaService) {}
//
//     async makePrismaUser(data: Partial<UserProps> = {}): Promise<User> {
//       const user = makeUser(data)
//       await this.prisma.user.create({ data: PrismaUserMapper.toPrisma(user) })
//       return user
//     }
//   }
