import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { EditTagUseCase } from '@/domain/support/application/use-cases/edit-tag'
import { TagPresenter } from '@/infra/http/presenters/tag-presenter'
import { editTagBodySchema, EditTagBodySchema } from './schemas/tag-body-schema'

@Controller('/ticket-tags/:id')
export class EditTagController {
  constructor(private editTag: EditTagUseCase) {}

  @Patch()
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(editTagBodySchema)) body: EditTagBodySchema,
  ) {
    const result = await this.editTag.execute({ id, ...body })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { tag: TagPresenter.toHTTP(result.value.tag) }
  }
}
