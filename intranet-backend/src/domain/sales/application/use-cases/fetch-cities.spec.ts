import { InMemoryClientsRepository } from 'test/repositories/in-memory-clients-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Client } from '../../enterprise/entities/client'
import { FetchCitiesUseCase } from './fetch-cities'

let clientsRepository: InMemoryClientsRepository
let sut: FetchCitiesUseCase

function makeClient(city: string, id: string) {
  return Client.create(
    {
      code: id,
      name: 'Alice',
      document: '000',
      zipCode: '00000',
      street: 'Street',
      city,
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

describe('Fetch Cities', () => {
  beforeEach(() => {
    clientsRepository = new InMemoryClientsRepository()
    sut = new FetchCitiesUseCase(clientsRepository)
  })

  it('returns the distinct sorted cities', async () => {
    clientsRepository.items.push(makeClient('Porto', 'c1'))
    clientsRepository.items.push(makeClient('Aveiro', 'c2'))
    clientsRepository.items.push(makeClient('Porto', 'c3'))

    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.cities).toEqual(['Aveiro', 'Porto'])
    }
  })
})
