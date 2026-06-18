import { InMemoryTagsRepository } from 'test/repositories/in-memory-tags-repository'
import { CreateTagUseCase } from './create-tag'

let tagsRepository: InMemoryTagsRepository
let sut: CreateTagUseCase

describe('Create Tag', () => {
  beforeEach(() => {
    tagsRepository = new InMemoryTagsRepository()
    sut = new CreateTagUseCase(tagsRepository)
  })

  it('creates a tag with defaults', async () => {
    const result = await sut.execute({ name: 'Bug', color: '#f00' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.tag.name).toBe('Bug')
      expect(result.value.tag.isActive).toBe(true)
      expect(result.value.tag.description).toBeNull()
      expect(result.value.tag.category).toBeNull()
    }
    expect(tagsRepository.items).toHaveLength(1)
  })

  it('respects provided optional fields', async () => {
    const result = await sut.execute({
      name: 'Feature',
      color: '#0f0',
      description: 'New feature',
      category: 'product',
      isActive: false,
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.tag.description).toBe('New feature')
      expect(result.value.tag.category).toBe('product')
      expect(result.value.tag.isActive).toBe(false)
    }
  })
})
