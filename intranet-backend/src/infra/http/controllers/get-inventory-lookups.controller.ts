import { Controller, Get } from '@nestjs/common'
import { FetchInventoryLookupsUseCase } from '@/domain/sales/application/use-cases/fetch-inventory-lookups'

@Controller('/inventory/lookups')
export class GetInventoryLookupsController {
  constructor(private fetchInventoryLookups: FetchInventoryLookupsUseCase) {}

  @Get()
  async handle() {
    const result = await this.fetchInventoryLookups.execute()
    const { types, reasons } = result.value!
    return { types, reasons }
  }
}
