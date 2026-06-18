import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { TagsRepository } from '../repositories/tags-repository'
import { Tag } from '../../enterprise/entities/tag'

interface EditTagUseCaseRequest {
  id: string
  name?: string
  color?: string
  description?: string | null
  category?: string | null
  isActive?: boolean
}

type EditTagUseCaseResponse = Either<ResourceNotFoundError, { tag: Tag }>

@Injectable()
export class EditTagUseCase {
  constructor(private tagsRepository: TagsRepository) {}

  async execute({
    id,
    ...data
  }: EditTagUseCaseRequest): Promise<EditTagUseCaseResponse> {
    const tag = await this.tagsRepository.findById(id)
    if (!tag) return left(new ResourceNotFoundError())

    if (data.name !== undefined) tag.name = data.name
    if (data.color !== undefined) tag.color = data.color
    if (data.description !== undefined) tag.description = data.description
    if (data.category !== undefined) tag.category = data.category
    if (data.isActive !== undefined) tag.isActive = data.isActive

    await this.tagsRepository.save(tag)
    return right({ tag })
  }
}
