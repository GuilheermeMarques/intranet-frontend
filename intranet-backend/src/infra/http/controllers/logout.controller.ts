import { Body, Controller, HttpCode, Post, UsePipes } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { LogoutUseCase } from '@/domain/iam/application/use-cases/logout'

const logoutBodySchema = z.object({ refreshToken: z.string() })
type LogoutBodySchema = z.infer<typeof logoutBodySchema>

@Controller('/sessions/logout')
export class LogoutController {
  constructor(private logout: LogoutUseCase) {}

  @Post()
  @HttpCode(204)
  @UsePipes(new ZodValidationPipe(logoutBodySchema))
  async handle(@Body() body: LogoutBodySchema) {
    await this.logout.execute({ refreshToken: body.refreshToken })
  }
}
