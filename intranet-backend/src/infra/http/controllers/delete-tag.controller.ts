import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { DeleteTagUseCase } from '@/domain/support/application/use-cases/delete-tag'

@Controller('/ticket-tags/:id')
export class DeleteTagController {
  constructor(private deleteTag: DeleteTagUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') id: string) {
    const result = await this.deleteTag.execute({ id })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
  }
}
