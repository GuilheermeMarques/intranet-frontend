import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { GetClientByIdUseCase } from '@/domain/sales/application/use-cases/get-client-by-id'
import { ClientPresenter } from '@/infra/http/presenters/client-presenter'

@Controller('/clients/:id')
export class GetClientByIdController {
  constructor(private getClientById: GetClientByIdUseCase) {}

  @Get()
  async handle(@Param('id') id: string) {
    const result = await this.getClientById.execute({ id })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { client: ClientPresenter.toHTTP(result.value.client) }
  }
}
