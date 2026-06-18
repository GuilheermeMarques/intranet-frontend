import { Controller, Get, NotFoundException, Param } from '@nestjs/common'
import { GetTicketByIdUseCase } from '@/domain/support/application/use-cases/get-ticket-by-id'
import { TicketPresenter } from '@/infra/http/presenters/ticket-presenter'

@Controller('/tickets/:id')
export class GetTicketByIdController {
  constructor(private getTicketById: GetTicketByIdUseCase) {}

  @Get()
  async handle(@Param('id') id: string) {
    const result = await this.getTicketById.execute({ id })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { ticket: TicketPresenter.toHTTP(result.value.ticket) }
  }
}
