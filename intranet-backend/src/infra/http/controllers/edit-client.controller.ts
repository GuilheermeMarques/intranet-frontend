import { Body, Controller, NotFoundException, Param, Patch, UsePipes } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { EditClientUseCase } from '@/domain/sales/application/use-cases/edit-client'
import { ClientPresenter } from '@/infra/http/presenters/client-presenter'
import {
  editClientBodySchema,
  EditClientBodySchema,
} from './schemas/client-body-schema'

@Controller('/clients/:id')
export class EditClientController {
  constructor(private editClient: EditClientUseCase) {}

  @Patch()
  @UsePipes(new ZodValidationPipe(editClientBodySchema))
  async handle(@Param('id') id: string, @Body() body: EditClientBodySchema) {
    const result = await this.editClient.execute({ id, ...body })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { client: ClientPresenter.toHTTP(result.value.client) }
  }
}
