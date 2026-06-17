import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UsePipes,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { z } from 'zod'
import { RefreshTokenUseCase } from '@/domain/iam/application/use-cases/refresh-token'
import { InvalidRefreshTokenError } from '@/domain/iam/application/use-cases/errors/invalid-refresh-token-error'
import { Public } from '@/infra/auth/public'

const refreshBodySchema = z.object({ refreshToken: z.string() })
type RefreshBodySchema = z.infer<typeof refreshBodySchema>

@Controller('/sessions/refresh')
@Public()
export class RefreshTokenController {
  constructor(private refreshToken: RefreshTokenUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(refreshBodySchema))
  async handle(@Body() body: RefreshBodySchema) {
    const result = await this.refreshToken.execute({ refreshToken: body.refreshToken })

    if (result.isLeft()) {
      const error = result.value
      switch (error.constructor) {
        case InvalidRefreshTokenError:
          throw new UnauthorizedException(error.message)
        default:
          throw new BadRequestException(error.message)
      }
    }

    const { accessToken, refreshToken } = result.value
    return { accessToken, refreshToken }
  }
}
