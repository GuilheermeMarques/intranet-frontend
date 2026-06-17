import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UsersRepository } from '../repositories/users-repository'
import { PermissionsRepository } from '../repositories/permissions-repository'

interface SetUserPermissionsUseCaseRequest {
  userId: string
  permissions: string[]
}

type SetUserPermissionsUseCaseResponse = Either<ResourceNotFoundError, { permissions: string[] }>

@Injectable()
export class SetUserPermissionsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private permissionsRepository: PermissionsRepository,
  ) {}

  async execute({ userId, permissions }: SetUserPermissionsUseCaseRequest): Promise<SetUserPermissionsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) return left(new ResourceNotFoundError())

    await this.permissionsRepository.replaceUserPermissions(userId, permissions)
    return right({ permissions })
  }
}
