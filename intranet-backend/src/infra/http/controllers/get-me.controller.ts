import { Controller, Get, NotFoundException } from '@nestjs/common'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { GetMeUseCase } from '@/domain/iam/application/use-cases/get-me'
import { UserPresenter } from '../presenters/user-presenter'

@Controller('/me')
export class GetMeController {
  constructor(private getMe: GetMeUseCase) {}

  @Get()
  async handle(@CurrentUser() currentUser: UserPayload) {
    const result = await this.getMe.execute({ userId: currentUser.sub })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    const { user, permissions } = result.value
    return { user: UserPresenter.toHTTP(user, permissions) }
  }
}
