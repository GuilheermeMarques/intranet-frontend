import { Body, Controller, Get, Patch, UsePipes } from '@nestjs/common'
import { z } from 'zod'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { CurrentUser } from '@/infra/auth/current-user-decorator'
import { UserPayload } from '@/infra/auth/jwt.strategy'
import { GetPreferencesUseCase } from '@/domain/iam/application/use-cases/get-preferences'
import { UpdatePreferencesUseCase } from '@/domain/iam/application/use-cases/update-preferences'
import { PreferencesPresenter } from '../presenters/preferences-presenter'

const updateBodySchema = z.object({
  theme: z.string().optional(),
  language: z.string().optional(),
  sidebarCollapsed: z.boolean().optional(),
})
type UpdateBodySchema = z.infer<typeof updateBodySchema>

@Controller('/me/preferences')
export class PreferencesController {
  constructor(
    private getPreferences: GetPreferencesUseCase,
    private updatePreferences: UpdatePreferencesUseCase,
  ) {}

  @Get()
  async get(@CurrentUser() currentUser: UserPayload) {
    const result = await this.getPreferences.execute({ userId: currentUser.sub })
    return { preferences: PreferencesPresenter.toHTTP(result.value!.preferences) }
  }

  @Patch()
  @UsePipes(new ZodValidationPipe(updateBodySchema))
  async patch(@CurrentUser() currentUser: UserPayload, @Body() body: UpdateBodySchema) {
    const result = await this.updatePreferences.execute({ userId: currentUser.sub, ...body })
    return { preferences: PreferencesPresenter.toHTTP(result.value!.preferences) }
  }
}
