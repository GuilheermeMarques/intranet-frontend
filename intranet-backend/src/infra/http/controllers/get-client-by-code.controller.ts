import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { GetClientByCodeUseCase } from '@/domain/sales/application/use-cases/get-client-by-code'
import { ClientPresenter } from '@/infra/http/presenters/client-presenter'

@Controller('/clients/code/:code')
export class GetClientByCodeController {
  constructor(private getClientByCode: GetClientByCodeUseCase) {}

  @Get()
  async handle(@Param('code') code: string) {
    const result = await this.getClientByCode.execute({ code })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { client: ClientPresenter.toHTTP(result.value.client) }
  }
}
