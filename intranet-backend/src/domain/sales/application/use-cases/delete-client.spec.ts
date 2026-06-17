import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Client } from '../../enterprise/entities/client'
import { DeleteClientUseCase } from './delete-client'

let clientsRepository: InMemoryClientsRepository
let sut: DeleteClientUseCase

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

describe('Delete Client', () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository()
    sut = new DeleteClientUseCase(clientsRepository)
  })

  it('deletes the client', async () => {
    clientsRepository.items.push(makeClient('c1'))

    const result = await sut.execute({ id: 'c1' })

    expect(result.isRight()).toBe(true)
    expect(clientsRepository.items).toHaveLength(0)
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
