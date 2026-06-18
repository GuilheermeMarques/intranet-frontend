import { InMemoryPrioritiesRepository } from 'test/repositories/in-memory-priorities-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Priority } from '../../enterprise/entities/priority'
import { FetchPrioritiesUseCase } from './fetch-priorities'

let prioritiesRepository: InMemoryPrioritiesRepository
let sut: FetchPrioritiesUseCase

function makePriority(level: number, id: string) {
  return Priority.create(
    { name: `P${level}`, color: '#000', level },
    new UniqueEntityID(id),
  )
}

describe('Fetch Priorities', () => {
  beforeEach(() => {
    prioritiesRepository = new InMemoryPrioritiesRepository()
    sut = new FetchPrioritiesUseCase(prioritiesRepository)
  })

  it('returns priorities sorted by level asc', async () => {
    prioritiesRepository.items.push(makePriority(3, 'p3'))
    prioritiesRepository.items.push(makePriority(1, 'p1'))
    prioritiesRepository.items.push(makePriority(2, 'p2'))

    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.priorities.map((p) => p.level)).toEqual([1, 2, 3])
    }
  })
})
