import { Body, Controller, Post } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { CreateTicketUseCase } from '@/domain/support/application/use-cases/create-ticket'
import { TicketPresenter } from '@/infra/http/presenters/ticket-presenter'
import {
  createTicketBodySchema,
  CreateTicketBodySchema,
} from './schemas/ticket-body-schema'

@Controller('/tickets')
export class CreateTicketController {
  constructor(private createTicket: CreateTicketUseCase) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createTicketBodySchema))
    body: CreateTicketBodySchema,
  ) {
    const result = await this.createTicket.execute(body)
    return { ticket: TicketPresenter.toHTTP(result.value!.ticket) }
  }
}
