import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PrioritiesRepository } from '../repositories/priorities-repository'

interface DeletePriorityUseCaseRequest {
  id: string
}
type DeletePriorityUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class DeletePriorityUseCase {
  constructor(private prioritiesRepository: PrioritiesRepository) {}

  async execute({
    id,
  }: DeletePriorityUseCaseRequest): Promise<DeletePriorityUseCaseResponse> {
    const priority = await this.prioritiesRepository.findById(id)
    if (!priority) return left(new ResourceNotFoundError())
    await this.prioritiesRepository.delete(priority)
    return right(null)
  }
}
