import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Client } from '../../enterprise/entities/client'
import { GetClientByCodeUseCase } from './get-client-by-code'

let clientsRepository: InMemoryClientsRepository
let sut: GetClientByCodeUseCase

function makeClient(code: string, id: string) {
  return Client.create(
    {
      code,
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

describe('Get Client By Code', () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository()
    sut = new GetClientByCodeUseCase(clientsRepository)
  })

  it('returns the client when found', async () => {
    clientsRepository.items.push(makeClient('CLI001', 'c1'))

    const result = await sut.execute({ code: 'CLI001' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.client.code).toBe('CLI001')
    }
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ code: 'CLI999' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
