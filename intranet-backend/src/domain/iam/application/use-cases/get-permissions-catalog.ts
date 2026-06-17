import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { PermissionsRepository } from '../repositories/permissions-repository'
import { Permission } from '../../enterprise/entities/permission'

type GetPermissionsCatalogUseCaseResponse = Either<never, { permissions: Permission[] }>

@Injectable()
export class GetPermissionsCatalogUseCase {
  constructor(private permissionsRepository: PermissionsRepository) {}

  async execute(): Promise<GetPermissionsCatalogUseCaseResponse> {
    const permissions = await this.permissionsRepository.findManyCatalog()
    return right({ permissions })
  }
}
