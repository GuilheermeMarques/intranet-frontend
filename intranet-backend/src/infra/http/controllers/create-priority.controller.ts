import { Body, Controller, Post, UsePipes } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { CreatePriorityUseCase } from '@/domain/support/application/use-cases/create-priority'
import { PriorityPresenter } from '@/infra/http/presenters/priority-presenter'
import {
  createPriorityBodySchema,
  CreatePriorityBodySchema,
} from './schemas/priority-body-schema'

@Controller('/ticket-priorities')
export class CreatePriorityController {
  constructor(private createPriority: CreatePriorityUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createPriorityBodySchema))
  async handle(@Body() body: CreatePriorityBodySchema) {
    const result = await this.createPriority.execute(body)
    return { priority: PriorityPresenter.toHTTP(result.value!.priority) }
  }
}
