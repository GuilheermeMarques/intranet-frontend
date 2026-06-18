import { InMemoryTagsRepository } from 'test/repositories/in-memory-tags-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Tag } from '../../enterprise/entities/tag'
import { DeleteTagUseCase } from './delete-tag'

let tagsRepository: InMemoryTagsRepository
let sut: DeleteTagUseCase

function makeTag(id: string) {
  return Tag.create({ name: 'Bug', color: '#f00' }, new UniqueEntityID(id))
}

describe('Delete Tag', () => {
  beforeEach(() => {
    tagsRepository = new InMemoryTagsRepository()
    sut = new DeleteTagUseCase(tagsRepository)
  })

  it('deletes the tag', async () => {
    tagsRepository.items.push(makeTag('t1'))

    const result = await sut.execute({ id: 't1' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toBeNull()
    expect(tagsRepository.items).toHaveLength(0)
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
