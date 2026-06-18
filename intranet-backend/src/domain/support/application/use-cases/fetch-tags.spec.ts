import { InMemoryTagsRepository } from 'test/repositories/in-memory-tags-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Tag } from '../../enterprise/entities/tag'
import { FetchTagsUseCase } from './fetch-tags'

let tagsRepository: InMemoryTagsRepository
let sut: FetchTagsUseCase

function makeTag(name: string, id: string) {
  return Tag.create({ name, color: '#000' }, new UniqueEntityID(id))
}

describe('Fetch Tags', () => {
  beforeEach(() => {
    tagsRepository = new InMemoryTagsRepository()
    sut = new FetchTagsUseCase(tagsRepository)
  })

  it('returns tags sorted by name', async () => {
    tagsRepository.items.push(makeTag('Charlie', 't3'))
    tagsRepository.items.push(makeTag('Alice', 't1'))
    tagsRepository.items.push(makeTag('Bob', 't2'))

    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.tags.map((t) => t.name)).toEqual([
        'Alice',
        'Bob',
        'Charlie',
      ])
    }
  })
})
