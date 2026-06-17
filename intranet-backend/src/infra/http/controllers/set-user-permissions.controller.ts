import { Body, Controller, NotFoundException, Param, Put } from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { RequirePermissions } from '@/infra/auth/require-permissions.decorator'
import { SetUserPermissionsUseCase } from '@/domain/iam/application/use-cases/set-user-permissions'

const bodySchema = z.object({ permissions: z.array(z.string()) })
type BodySchema = z.infer<typeof bodySchema>

@Controller('/users/:id/permissions')
export class SetUserPermissionsController {
  constructor(private setUserPermissions: SetUserPermissionsUseCase) {}

  @Put()
  @RequirePermissions('settings.permissions.manage')
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(bodySchema)) body: BodySchema,
  ) {
    const result = await this.setUserPermissions.execute({ userId: id, permissions: body.permissions })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { permissions: result.value.permissions }
  }
}
