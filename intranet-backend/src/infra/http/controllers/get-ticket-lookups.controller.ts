import { Controller, Get } from '@nestjs/common'
import { FetchTicketLookupsUseCase } from '@/domain/support/application/use-cases/fetch-ticket-lookups'

@Controller('/tickets/lookups')
export class GetTicketLookupsController {
  constructor(private fetchTicketLookups: FetchTicketLookupsUseCase) {}

  @Get()
  async handle() {
    const result = await this.fetchTicketLookups.execute()
    const { categories, assignees } = result.value!
    return { categories, assignees }
  }
}
