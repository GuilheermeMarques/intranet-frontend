import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { TagsRepository } from '../repositories/tags-repository'

interface DeleteTagUseCaseRequest {
  id: string
}
type DeleteTagUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class DeleteTagUseCase {
  constructor(private tagsRepository: TagsRepository) {}

  async execute({
    id,
  }: DeleteTagUseCaseRequest): Promise<DeleteTagUseCaseResponse> {
    const tag = await this.tagsRepository.findById(id)
    if (!tag) return left(new ResourceNotFoundError())
    await this.tagsRepository.delete(tag)
    return right(null)
  }
}
