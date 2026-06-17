import { Body, Controller, Post } from '@nestjs/common'
import { ZodValidationPipe } from '@/infra/http/pipes/zod-validation-pipe'
import { CreateInventoryMovementUseCase } from '@/domain/sales/application/use-cases/create-inventory-movement'
import { InventoryMovementPresenter } from '@/infra/http/presenters/inventory-movement-presenter'
import {
  createInventoryMovementBodySchema,
  CreateInventoryMovementBodySchema,
} from './schemas/inventory-body-schema'

@Controller('/inventory/movements')
export class CreateInventoryMovementController {
  constructor(
    private createInventoryMovement: CreateInventoryMovementUseCase,
  ) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(createInventoryMovementBodySchema))
    body: CreateInventoryMovementBodySchema,
  ) {
    const result = await this.createInventoryMovement.execute(body)
    return {
      movement: InventoryMovementPresenter.toHTTP(result.value!.movement),
    }
  }
}
