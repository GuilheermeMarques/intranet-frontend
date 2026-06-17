import { Controller, Get, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { FetchClientsUseCase } from '@/domain/sales/application/use-cases/fetch-clients'
import { ClientPresenter } from '@/infra/http/presenters/client-presenter'
import {
  fetchClientsQuerySchema,
  FetchClientsQuerySchema,
} from './schemas/client-body-schema'

@Controller('/clients')
export class FetchClientsController {
  constructor(private fetchClients: FetchClientsUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(fetchClientsQuerySchema)) query: FetchClientsQuerySchema,
  ) {
    const result = await this.fetchClients.execute({
      filters: {
        code: query.code,
        name: query.name,
        city: query.city,
        startDate: query.startDate,
        endDate: query.endDate,
      },
    })

    const { clients, cities } = result.value!

    return { clients: clients.map(ClientPresenter.toHTTP), cities }
  }
}
