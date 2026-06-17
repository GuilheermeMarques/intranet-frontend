import { Controller, Get } from '@nestjs/common'
import { RequirePermissions } from '@/infra/auth/require-permissions.decorator'
import { ListUsersUseCase } from '@/domain/iam/application/use-cases/list-users'
import { AccessControlUserPresenter } from '../presenters/access-control-user-presenter'

@Controller('/users')
export class ListUsersController {
  constructor(private listUsers: ListUsersUseCase) {}

  @Get()
  @RequirePermissions('settings.permissions.manage')
  async handle() {
    const result = await this.listUsers.execute()
    const users = result.value!.users.map(({ user, permissions }) =>
      AccessControlUserPresenter.toHTTP(user, permissions),
    )
    return { users }
  }
}
