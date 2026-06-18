import { InMemoryTagsRepository } from 'test/repositories/in-memory-tags-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Tag } from '../../enterprise/entities/tag'
import { EditTagUseCase } from './edit-tag'

let tagsRepository: InMemoryTagsRepository
let sut: EditTagUseCase

function makeTag(id: string) {
  return Tag.create({ name: 'Bug', color: '#f00' }, new UniqueEntityID(id))
}

describe('Edit Tag', () => {
  beforeEach(() => {
    tagsRepository = new InMemoryTagsRepository()
    sut = new EditTagUseCase(tagsRepository)
  })

  it('patches only the provided fields', async () => {
    tagsRepository.items.push(makeTag('t1'))

    const result = await sut.execute({ id: 't1', name: 'Defect', category: 'qa' })

    expect(result.isRight()).toBe(true)
    const stored = tagsRepository.items[0]
    expect(stored.name).toBe('Defect')
    expect(stored.category).toBe('qa')
    expect(stored.color).toBe('#f00')
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope', name: 'X' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
