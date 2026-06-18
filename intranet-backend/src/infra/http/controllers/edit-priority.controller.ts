import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { EditPriorityUseCase } from '@/domain/support/application/use-cases/edit-priority'
import { PriorityPresenter } from '@/infra/http/presenters/priority-presenter'
import {
  editPriorityBodySchema,
  EditPriorityBodySchema,
} from './schemas/priority-body-schema'

@Controller('/ticket-priorities/:id')
export class EditPriorityController {
  constructor(private editPriority: EditPriorityUseCase) {}

  @Patch()
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(editPriorityBodySchema))
    body: EditPriorityBodySchema,
  ) {
    const result = await this.editPriority.execute({ id, ...body })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { priority: PriorityPresenter.toHTTP(result.value.priority) }
  }
}
