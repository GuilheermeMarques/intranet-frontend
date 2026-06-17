import { InMemoryInventoryMovementsRepository } from 'test/repositories/in-memory-inventory-movements-repository'
import { CreateInventoryMovementUseCase } from './create-inventory-movement'

let movementsRepository: InMemoryInventoryMovementsRepository
let sut: CreateInventoryMovementUseCase

describe('Create Inventory Movement', () => {
  beforeEach(() => {
    movementsRepository = new InMemoryInventoryMovementsRepository()
    sut = new CreateInventoryMovementUseCase(movementsRepository)
  })

  it('creates and persists an inventory movement', async () => {
    const result = await sut.execute({
      productCode: 'PROD001',
      description: 'Compra de fornecedor',
      quantity: 50,
      type: 'inbound',
      reason: 'Compra de fornecedor',
      handledBy: 'Admin',
      notes: 'Lote inicial',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.movement.productCode).toBe('PROD001')
      expect(result.value.movement.type).toBe('inbound')
      expect(result.value.movement.quantity).toBe(50)
      expect(result.value.movement.occurredAt).toBeInstanceOf(Date)
    }
    expect(movementsRepository.items).toHaveLength(1)
  })

  it('defaults optional fields when omitted', async () => {
    const result = await sut.execute({
      productCode: 'PROD002',
      description: 'Venda',
      quantity: 5,
      type: 'outbound',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.movement.reason).toBeNull()
      expect(result.value.movement.handledBy).toBeNull()
      expect(result.value.movement.notes).toBeNull()
    }
  })
})
