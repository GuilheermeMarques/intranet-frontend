import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { PrioritiesRepository } from '../repositories/priorities-repository'
import { Priority } from '../../enterprise/entities/priority'

interface EditPriorityUseCaseRequest {
  id: string
  name?: string
  color?: string
  level?: number
  description?: string | null
  isActive?: boolean
}

type EditPriorityUseCaseResponse = Either<
  ResourceNotFoundError,
  { priority: Priority }
>

@Injectable()
export class EditPriorityUseCase {
  constructor(private prioritiesRepository: PrioritiesRepository) {}

  async execute({
    id,
    ...data
  }: EditPriorityUseCaseRequest): Promise<EditPriorityUseCaseResponse> {
    const priority = await this.prioritiesRepository.findById(id)
    if (!priority) return left(new ResourceNotFoundError())

    if (data.name !== undefined) priority.name = data.name
    if (data.color !== undefined) priority.color = data.color
    if (data.level !== undefined) priority.level = data.level
    if (data.description !== undefined) priority.description = data.description
    if (data.isActive !== undefined) priority.isActive = data.isActive

    await this.prioritiesRepository.save(priority)
    return right({ priority })
  }
}
