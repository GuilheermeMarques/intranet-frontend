import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Client } from '../../enterprise/entities/client'
import { EditClientUseCase } from './edit-client'

let clientsRepository: InMemoryClientsRepository
let sut: EditClientUseCase

function makeClient(id: string) {
  return Client.create(
    {
      code: 'CLI001',
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
    },
    new UniqueEntityID(id),
  )
}

describe('Edit Client', () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository()
    sut = new EditClientUseCase(clientsRepository)
  })

  it('patches only the provided fields', async () => {
    clientsRepository.items.push(makeClient('c1'))

    const result = await sut.execute({ id: 'c1', name: 'Alicia', city: 'Aveiro' })

    expect(result.isRight()).toBe(true)
    const stored = clientsRepository.items[0]
    expect(stored.name).toBe('Alicia')
    expect(stored.city).toBe('Aveiro')
    expect(stored.email).toBe('alice@example.com')
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope', name: 'X' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
