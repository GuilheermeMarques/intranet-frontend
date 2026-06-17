import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { InventoryMovementsRepository } from '../repositories/inventory-movements-repository'
import {
  InventoryMovement,
  InventoryMovementType,
} from '../../enterprise/entities/inventory-movement'

interface CreateInventoryMovementUseCaseRequest {
  productCode: string
  description: string
  quantity: number
  type: InventoryMovementType
  reason?: string
  handledBy?: string
  notes?: string
  occurredAt?: Date
}

type CreateInventoryMovementUseCaseResponse = Either<
  never,
  { movement: InventoryMovement }
>

@Injectable()
export class CreateInventoryMovementUseCase {
  constructor(
    private inventoryMovementsRepository: InventoryMovementsRepository,
  ) {}

  async execute(
    data: CreateInventoryMovementUseCaseRequest,
  ): Promise<CreateInventoryMovementUseCaseResponse> {
    const movement = InventoryMovement.create(data)
    await this.inventoryMovementsRepository.create(movement)

    return right({ movement })
  }
}
