import { Controller, Get, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { FetchRepresentativesUseCase } from '@/domain/sales/application/use-cases/fetch-representatives'
import { RepresentativePresenter } from '@/infra/http/presenters/representative-presenter'
import {
  fetchRepresentativesQuerySchema,
  FetchRepresentativesQuerySchema,
} from './schemas/representative-body-schema'

@Controller('/representatives')
export class FetchRepresentativesController {
  constructor(private fetchRepresentatives: FetchRepresentativesUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(fetchRepresentativesQuerySchema))
    query: FetchRepresentativesQuerySchema,
  ) {
    const result = await this.fetchRepresentatives.execute({
      filters: {
        name: query.name,
        region: query.region,
        status: query.status,
      },
    })

    const { representatives, regions, statusOptions } = result.value!

    return {
      representatives: representatives.map(RepresentativePresenter.toHTTP),
      regions,
      statusOptions,
    }
  }
}
