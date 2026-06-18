import { Controller, Get, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { FetchTicketsUseCase } from '@/domain/support/application/use-cases/fetch-tickets'
import { TicketPresenter } from '@/infra/http/presenters/ticket-presenter'
import {
  ticketQuerySchema,
  TicketQuerySchema,
} from './schemas/ticket-body-schema'

@Controller('/tickets')
export class FetchTicketsController {
  constructor(private fetchTickets: FetchTicketsUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(ticketQuerySchema)) query: TicketQuerySchema,
  ) {
    const result = await this.fetchTickets.execute({
      filters: {
        search: query.search,
        priority: query.priority,
        status: query.status,
        category: query.category,
        assignee: query.assignee,
      },
    })

    const { tickets } = result.value!

    return { tickets: tickets.map(TicketPresenter.toHTTP) }
  }
}
