import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import {
  InventoryMovementFilters,
  InventoryMovementsRepository,
} from '../repositories/inventory-movements-repository'
import { InventoryMovement } from '../../enterprise/entities/inventory-movement'

interface FetchInventoryMovementsUseCaseRequest {
  filters: InventoryMovementFilters
}
type FetchInventoryMovementsUseCaseResponse = Either<
  never,
  { movements: InventoryMovement[] }
>

@Injectable()
export class FetchInventoryMovementsUseCase {
  constructor(
    private inventoryMovementsRepository: InventoryMovementsRepository,
  ) {}

  async execute({
    filters,
  }: FetchInventoryMovementsUseCaseRequest): Promise<FetchInventoryMovementsUseCaseResponse> {
    const movements = await this.inventoryMovementsRepository.findMany(filters)
    return right({ movements })
  }
}
