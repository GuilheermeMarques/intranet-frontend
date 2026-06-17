import { Body, Controller, NotFoundException, Param, Patch } from '@nestjs/common'
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
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(editClientBodySchema)) body: EditClientBodySchema,
  ) {
    const result = await this.editClient.execute({ id, ...body })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { client: ClientPresenter.toHTTP(result.value.client) }
  }
}
