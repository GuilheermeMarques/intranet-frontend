import { InMemoryPrioritiesRepository } from 'test/repositories/in-memory-priorities-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Priority } from '../../enterprise/entities/priority'
import { DeletePriorityUseCase } from './delete-priority'

let prioritiesRepository: InMemoryPrioritiesRepository
let sut: DeletePriorityUseCase

function makePriority(id: string) {
  return Priority.create(
    { name: 'High', color: '#f00', level: 1 },
    new UniqueEntityID(id),
  )
}

describe('Delete Priority', () => {
  beforeEach(() => {
    prioritiesRepository = new InMemoryPrioritiesRepository()
    sut = new DeletePriorityUseCase(prioritiesRepository)
  })

  it('deletes the priority', async () => {
    prioritiesRepository.items.push(makePriority('p1'))

    const result = await sut.execute({ id: 'p1' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toBeNull()
    expect(prioritiesRepository.items).toHaveLength(0)
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
