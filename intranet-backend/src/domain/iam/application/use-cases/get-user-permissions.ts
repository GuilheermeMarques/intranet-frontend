import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UsersRepository } from '../repositories/users-repository'
import { PermissionsRepository } from '../repositories/permissions-repository'

interface GetUserPermissionsUseCaseRequest { userId: string }
type GetUserPermissionsUseCaseResponse = Either<ResourceNotFoundError, { permissions: string[] }>

@Injectable()
export class GetUserPermissionsUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private permissionsRepository: PermissionsRepository,
  ) {}

  async execute({ userId }: GetUserPermissionsUseCaseRequest): Promise<GetUserPermissionsUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) return left(new ResourceNotFoundError())
    const permissions = await this.permissionsRepository.findKeysByUserId(userId)
    return right({ permissions })
  }
}
