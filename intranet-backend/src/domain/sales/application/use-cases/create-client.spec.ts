import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository'
import { CreateClientUseCase } from './create-client'

let clientsRepository: InMemoryClientsRepository
let sut: CreateClientUseCase

const input = {
  name: 'Alice',
  document: '000',
  zipCode: '00000',
  street: 'Street',
  city: 'Porto',
  state: 'ST',
  neighborhood: 'Center',
  number: '1',
  complement: '',
  email: 'alice@example.com',
  phone: '999',
  instagram: '@alice',
}

describe('Create Client', () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository()
    sut = new CreateClientUseCase(clientsRepository)
  })

  it('creates a client with auto-generated code and defaults', async () => {
    const result = await sut.execute(input)

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.client.code).toBe('CLI001')
      expect(result.value.client.lastPurchaseAt).toBeNull()
      expect(result.value.client.purchaseCount).toBe(0)
    }
    expect(clientsRepository.items).toHaveLength(1)
  })

  it('increments the code based on the existing count', async () => {
    await sut.execute(input)
    const result = await sut.execute({ ...input, name: 'Bob' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.client.code).toBe('CLI002')
    }
  })
})
