import { Body, Controller, Post, UsePipes } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { CreateTagUseCase } from '@/domain/support/application/use-cases/create-tag'
import { TagPresenter } from '@/infra/http/presenters/tag-presenter'
import {
  createTagBodySchema,
  CreateTagBodySchema,
} from './schemas/tag-body-schema'

@Controller('/ticket-tags')
export class CreateTagController {
  constructor(private createTag: CreateTagUseCase) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createTagBodySchema))
  async handle(@Body() body: CreateTagBodySchema) {
    const result = await this.createTag.execute(body)
    return { tag: TagPresenter.toHTTP(result.value!.tag) }
  }
}
