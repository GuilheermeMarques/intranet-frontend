import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { TagsRepository } from '../repositories/tags-repository'
import { Tag } from '../../enterprise/entities/tag'

interface CreateTagUseCaseRequest {
  name: string
  color: string
  description?: string
  category?: string
  isActive?: boolean
}

type CreateTagUseCaseResponse = Either<never, { tag: Tag }>

@Injectable()
export class CreateTagUseCase {
  constructor(private tagsRepository: TagsRepository) {}

  async execute(data: CreateTagUseCaseRequest): Promise<CreateTagUseCaseResponse> {
    const tag = Tag.create(data)
    await this.tagsRepository.create(tag)
    return right({ tag })
  }
}
