import { Controller, Get } from '@nestjs/common'
import { FetchCitiesUseCase } from '@/domain/sales/application/use-cases/fetch-cities'

@Controller('/clients/lookups')
export class GetClientLookupsController {
  constructor(private fetchCities: FetchCitiesUseCase) {}

  @Get()
  async handle() {
    const result = await this.fetchCities.execute()
    const { cities } = result.value!
    return { cities }
  }
}
