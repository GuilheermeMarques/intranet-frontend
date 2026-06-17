import { Controller, Get } from '@nestjs/common'
import { GetPermissionsCatalogUseCase } from '@/domain/iam/application/use-cases/get-permissions-catalog'
import { PermissionPresenter } from '../presenters/permission-presenter'

@Controller('/permissions')
export class GetPermissionsCatalogController {
  constructor(private getCatalog: GetPermissionsCatalogUseCase) {}

  @Get()
  async handle() {
    const result = await this.getCatalog.execute()
    return { permissions: result.value!.permissions.map(PermissionPresenter.toHTTP) }
  }
}
