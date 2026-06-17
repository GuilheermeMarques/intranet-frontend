import { InMemoryRepresentativesRepository } from 'test/repositories/in-memory-representatives-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Representative } from '../../enterprise/entities/representative'
import { FetchRepresentativesUseCase } from './fetch-representatives'

let representativesRepository: InMemoryRepresentativesRepository
let sut: FetchRepresentativesUseCase

function makeRepresentative(
  override: Partial<{ name: string; region: string; status: string }>,
  id: string,
) {
  return Representative.create(
    {
      name: 'Default',
      email: 'rep@example.com',
      phone: '999',
      region: 'Sul',
      status: 'active',
      totalSales: 0,
      monthlyGoal: 0,
      clientsCount: 0,
      ...override,
    },
    new UniqueEntityID(id),
  )
}

describe('Fetch Representatives', () => {
  beforeEach(() => {
    representativesRepository = new InMemoryRepresentativesRepository()
    sut = new FetchRepresentativesUseCase(representativesRepository)
  })

  it('filters by region and returns distinct regions and fixed status options', async () => {
    representativesRepository.items.push(
      makeRepresentative({ name: 'Alice', region: 'Sul' }, 'r1'),
    )
    representativesRepository.items.push(
      makeRepresentative({ name: 'Bob', region: 'Norte' }, 'r2'),
    )
    representativesRepository.items.push(
      makeRepresentative({ name: 'Carol', region: 'Sul' }, 'r3'),
    )

    const result = await sut.execute({ filters: { region: 'Sul' } })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.representatives).toHaveLength(2)
      expect(result.value.representatives.map((r) => r.name).sort()).toEqual([
        'Alice',
        'Carol',
      ])
      expect(result.value.regions).toEqual(['Norte', 'Sul'])
      expect(result.value.statusOptions).toHaveLength(4)
      expect(result.value.statusOptions).toEqual([
        { value: 'active', label: 'Ativo' },
        { value: 'inactive', label: 'Inativo' },
        { value: 'vacation', label: 'Férias' },
        { value: 'training', label: 'Treinamento' },
      ])
    }
  })
})
