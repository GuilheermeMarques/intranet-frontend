import { Body, Controller, NotFoundException, Param, Post } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { AddTicketMessageUseCase } from '@/domain/support/application/use-cases/add-ticket-message'
import { MessagePresenter } from '@/infra/http/presenters/message-presenter'
import {
  addMessageBodySchema,
  AddMessageBodySchema,
} from './schemas/ticket-body-schema'

@Controller('/tickets/:id/messages')
export class AddTicketMessageController {
  constructor(private addTicketMessage: AddTicketMessageUseCase) {}

  @Post()
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(addMessageBodySchema))
    body: AddMessageBodySchema,
  ) {
    const result = await this.addTicketMessage.execute({
      ticketId: id,
      ...body,
    })
    if (result.isLeft()) throw new NotFoundException(result.value.message)
    return { message: MessagePresenter.toHTTP(result.value.message) }
  }
}
