import { Controller, Get, Query } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { FetchInventoryMovementsUseCase } from '@/domain/sales/application/use-cases/fetch-inventory-movements'
import { InventoryMovementPresenter } from '@/infra/http/presenters/inventory-movement-presenter'
import {
  inventoryMovementQuerySchema,
  InventoryMovementQuerySchema,
} from './schemas/inventory-body-schema'

@Controller('/inventory/movements')
export class FetchInventoryMovementsController {
  constructor(private fetchInventoryMovements: FetchInventoryMovementsUseCase) {}

  @Get()
  async handle(
    @Query(new ZodValidationPipe(inventoryMovementQuerySchema))
    query: InventoryMovementQuerySchema,
  ) {
    const result = await this.fetchInventoryMovements.execute({
      filters: {
        productCode: query.productCode,
        description: query.description,
        type: query.type,
        startDate: query.startDate,
        endDate: query.endDate,
      },
    })

    const { movements } = result.value!

    return { movements: movements.map(InventoryMovementPresenter.toHTTP) }
  }
}
