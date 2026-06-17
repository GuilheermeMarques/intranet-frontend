import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Client } from '../../enterprise/entities/client'
import { FetchClientsUseCase } from './fetch-clients'

let clientsRepository: InMemoryClientsRepository
let sut: FetchClientsUseCase

function makeClient(
  override: Partial<{ name: string; city: string }>,
  id: string,
) {
  return Client.create(
    {
      code: id,
      name: 'Default',
      document: '000',
      zipCode: '00000',
      street: 'Street',
      city: 'City',
      state: 'ST',
      neighborhood: 'Center',
      number: '1',
      complement: '',
      email: 'client@example.com',
      phone: '999',
      instagram: '@client',
      ...override,
    },
    new UniqueEntityID(id),
  )
}

describe('Fetch Clients', () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository()
    sut = new FetchClientsUseCase(clientsRepository)
  })

  it('filters clients by partial name and returns the distinct sorted cities', async () => {
    clientsRepository.items.push(makeClient({ name: 'Alice', city: 'Porto' }, 'c1'))
    clientsRepository.items.push(makeClient({ name: 'Bob', city: 'Aveiro' }, 'c2'))
    clientsRepository.items.push(makeClient({ name: 'Alicia', city: 'Porto' }, 'c3'))

    const result = await sut.execute({ filters: { name: 'ali' } })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.clients).toHaveLength(2)
      expect(result.value.clients.map((c) => c.name).sort()).toEqual([
        'Alice',
        'Alicia',
      ])
      expect(result.value.cities).toEqual(['Aveiro', 'Porto'])
    }
  })
})
