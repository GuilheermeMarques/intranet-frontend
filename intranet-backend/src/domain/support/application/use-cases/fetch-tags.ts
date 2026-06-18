import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { TagsRepository } from '../repositories/tags-repository'
import { Tag } from '../../enterprise/entities/tag'

type FetchTagsUseCaseResponse = Either<never, { tags: Tag[] }>

@Injectable()
export class FetchTagsUseCase {
  constructor(private tagsRepository: TagsRepository) {}

  async execute(): Promise<FetchTagsUseCaseResponse> {
    const tags = await this.tagsRepository.findMany()
    return right({ tags })
  }
}
