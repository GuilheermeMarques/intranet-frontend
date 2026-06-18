import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { DeletePriorityUseCase } from '@/domain/support/application/use-cases/delete-priority'

@Controller('/ticket-priorities/:id')
export class DeletePriorityController {
  constructor(private deletePriority: DeletePriorityUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') id: string) {
    const result = await this.deletePriority.execute({ id })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
  }
}
