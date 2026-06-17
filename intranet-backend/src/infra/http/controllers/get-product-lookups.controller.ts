import { Controller, Get } from '@nestjs/common'
import { FetchProductLookupsUseCase } from '@/domain/sales/application/use-cases/fetch-product-lookups'

@Controller('/products/lookups')
export class GetProductLookupsController {
  constructor(private fetchProductLookups: FetchProductLookupsUseCase) {}

  @Get()
  async handle() {
    const result = await this.fetchProductLookups.execute()
    const { categories, suppliers } = result.value!
    return { categories, suppliers }
  }
}
