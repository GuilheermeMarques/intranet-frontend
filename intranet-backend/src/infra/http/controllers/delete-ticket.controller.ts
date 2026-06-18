import {
  Controller,
  Delete,
  HttpCode,
  NotFoundException,
  Param,
} from '@nestjs/common'
import { DeleteTicketUseCase } from '@/domain/support/application/use-cases/delete-ticket'

@Controller('/tickets/:id')
export class DeleteTicketController {
  constructor(private deleteTicket: DeleteTicketUseCase) {}

  @Delete()
  @HttpCode(204)
  async handle(@Param('id') id: string) {
    const result = await this.deleteTicket.execute({ id })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
  }
}
