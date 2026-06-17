import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { PermissionsRepository } from '@/domain/iam/application/repositories/permissions-repository'
import { REQUIRE_PERMISSIONS_KEY } from './require-permissions.decorator'
import { UserPayload } from './jwt.strategy'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsRepository: PermissionsRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRE_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    if (!required || required.length === 0) return true

    const request = context.switchToHttp().getRequest()
    const user = request.user as UserPayload | undefined
    if (!user) return false

    const keys = await this.permissionsRepository.findKeysByUserId(user.sub)
    return required.every((permission) => keys.includes(permission))
  }
}
