import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Client } from '../../enterprise/entities/client'
import { GetClientByIdUseCase } from './get-client-by-id'

let clientsRepository: InMemoryClientsRepository
let sut: GetClientByIdUseCase

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
      email: 'client@example.com',
      phone: '999',
      instagram: '@client',
    },
    new UniqueEntityID(id),
  )
}

describe('Get Client By Id', () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository()
    sut = new GetClientByIdUseCase(clientsRepository)
  })

  it('returns the client when found', async () => {
    clientsRepository.items.push(makeClient('c1'))

    const result = await sut.execute({ id: 'c1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.client.id.toString()).toBe('c1')
    }
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
