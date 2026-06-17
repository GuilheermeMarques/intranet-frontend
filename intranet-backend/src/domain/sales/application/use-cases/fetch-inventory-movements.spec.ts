import { InMemoryInventoryMovementsRepository } from 'test/repositories/in-memory-inventory-movements-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { InventoryMovement } from '../../enterprise/entities/inventory-movement'
import { InventoryMovementType } from '../../enterprise/entities/inventory-movement'
import { FetchInventoryMovementsUseCase } from './fetch-inventory-movements'

let movementsRepository: InMemoryInventoryMovementsRepository
let sut: FetchInventoryMovementsUseCase

function makeMovement(
  override: Partial<{
    productCode: string
    type: InventoryMovementType
    occurredAt: Date
  }>,
  id: string,
) {
  return InventoryMovement.create(
    {
      productCode: 'PROD001',
      description: 'Movement',
      quantity: 10,
      type: 'inbound',
      ...override,
    },
    new UniqueEntityID(id),
  )
}

describe('Fetch Inventory Movements', () => {
  beforeEach(() => {
    movementsRepository = new InMemoryInventoryMovementsRepository()
    sut = new FetchInventoryMovementsUseCase(movementsRepository)
  })

  it('filters movements by type and date range', async () => {
    movementsRepository.items.push(
      makeMovement(
        { type: 'inbound', occurredAt: new Date('2026-01-10T00:00:00.000Z') },
        'm1',
      ),
    )
    movementsRepository.items.push(
      makeMovement(
        { type: 'outbound', occurredAt: new Date('2026-02-10T00:00:00.000Z') },
        'm2',
      ),
    )
    movementsRepository.items.push(
      makeMovement(
        { type: 'inbound', occurredAt: new Date('2026-03-10T00:00:00.000Z') },
        'm3',
      ),
    )

    const result = await sut.execute({
      filters: {
        type: 'inbound',
        startDate: new Date('2026-02-01T00:00:00.000Z'),
        endDate: new Date('2026-04-01T00:00:00.000Z'),
      },
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.movements).toHaveLength(1)
      expect(result.value.movements[0].id.toString()).toBe('m3')
    }
  })
})
