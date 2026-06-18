import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
} from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { EditTicketUseCase } from '@/domain/support/application/use-cases/edit-ticket'
import { TicketPresenter } from '@/infra/http/presenters/ticket-presenter'
import {
  editTicketBodySchema,
  EditTicketBodySchema,
} from './schemas/ticket-body-schema'

@Controller('/tickets/:id')
export class EditTicketController {
  constructor(private editTicket: EditTicketUseCase) {}

  @Patch()
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(editTicketBodySchema))
    body: EditTicketBodySchema,
  ) {
    const result = await this.editTicket.execute({ id, ...body })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { ticket: TicketPresenter.toHTTP(result.value.ticket) }
  }
}
