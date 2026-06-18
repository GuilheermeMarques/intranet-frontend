import { InMemoryPrioritiesRepository } from 'test/repositories/in-memory-priorities-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Priority } from '../../enterprise/entities/priority'
import { EditPriorityUseCase } from './edit-priority'

let prioritiesRepository: InMemoryPrioritiesRepository
let sut: EditPriorityUseCase

function makePriority(id: string) {
  return Priority.create(
    { name: 'High', color: '#f00', level: 1 },
    new UniqueEntityID(id),
  )
}

describe('Edit Priority', () => {
  beforeEach(() => {
    prioritiesRepository = new InMemoryPrioritiesRepository()
    sut = new EditPriorityUseCase(prioritiesRepository)
  })

  it('patches only the provided fields', async () => {
    prioritiesRepository.items.push(makePriority('p1'))

    const result = await sut.execute({ id: 'p1', name: 'Critical', level: 0 })

    expect(result.isRight()).toBe(true)
    const stored = prioritiesRepository.items[0]
    expect(stored.name).toBe('Critical')
    expect(stored.level).toBe(0)
    expect(stored.color).toBe('#f00')
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope', name: 'X' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
