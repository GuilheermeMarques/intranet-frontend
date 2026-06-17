import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { GetUserPermissionsUseCase } from '@/domain/iam/application/use-cases/get-user-permissions'

@Controller('/users/:id/permissions')
export class GetUserPermissionsController {
  constructor(private getUserPermissions: GetUserPermissionsUseCase) {}

  @Get()
  async handle(@Param('id') id: string) {
    const result = await this.getUserPermissions.execute({ userId: id })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { permissions: result.value.permissions }
  }
}
