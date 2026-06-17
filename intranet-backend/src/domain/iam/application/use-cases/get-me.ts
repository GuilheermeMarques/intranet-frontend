import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UsersRepository } from '../repositories/users-repository'
import { PermissionsRepository } from '../repositories/permissions-repository'
import { User } from '../../enterprise/entities/user'

interface GetMeUseCaseRequest {
  userId: string
}

type GetMeUseCaseResponse = Either<ResourceNotFoundError, { user: User; permissions: string[] }>

@Injectable()
export class GetMeUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private permissionsRepository: PermissionsRepository,
  ) {}

  async execute({ userId }: GetMeUseCaseRequest): Promise<GetMeUseCaseResponse> {
    const user = await this.usersRepository.findById(userId)
    if (!user) return left(new ResourceNotFoundError())

    const permissions = await this.permissionsRepository.findKeysByUserId(userId)
    return right({ user, permissions })
  }
}
