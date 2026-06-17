import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { UsersRepository } from '../repositories/users-repository'
import { PermissionsRepository } from '../repositories/permissions-repository'
import { User } from '../../enterprise/entities/user'

type ListUsersUseCaseResponse = Either<never, { users: { user: User; permissions: string[] }[] }>

@Injectable()
export class ListUsersUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private permissionsRepository: PermissionsRepository,
  ) {}

  async execute(): Promise<ListUsersUseCaseResponse> {
    const users = await this.usersRepository.findMany()
    const result = await Promise.all(
      users.map(async (user) => ({
        user,
        permissions: await this.permissionsRepository.findKeysByUserId(user.id.toString()),
      })),
    )
    return right({ users: result })
  }
}
