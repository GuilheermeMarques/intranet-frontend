import { InMemoryPrioritiesRepository } from 'test/repositories/in-memory-priorities-repository'
import { CreatePriorityUseCase } from './create-priority'

let prioritiesRepository: InMemoryPrioritiesRepository
let sut: CreatePriorityUseCase

describe('Create Priority', () => {
  beforeEach(() => {
    prioritiesRepository = new InMemoryPrioritiesRepository()
    sut = new CreatePriorityUseCase(prioritiesRepository)
  })

  it('creates a priority with defaults', async () => {
    const result = await sut.execute({ name: 'High', color: '#f00', level: 1 })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.priority.name).toBe('High')
      expect(result.value.priority.isActive).toBe(true)
      expect(result.value.priority.description).toBeNull()
    }
    expect(prioritiesRepository.items).toHaveLength(1)
  })

  it('respects provided isActive and description', async () => {
    const result = await sut.execute({
      name: 'Low',
      color: '#0f0',
      level: 5,
      description: 'Low prio',
      isActive: false,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.priority.description).toBe('Low prio')
      expect(result.value.priority.isActive).toBe(false)
    }
  })
})
