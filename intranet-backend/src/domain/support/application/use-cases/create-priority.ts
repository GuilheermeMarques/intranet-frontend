import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { PrioritiesRepository } from '../repositories/priorities-repository'
import { Priority } from '../../enterprise/entities/priority'

interface CreatePriorityUseCaseRequest {
  name: string
  color: string
  level: number
  description?: string
  isActive?: boolean
}

type CreatePriorityUseCaseResponse = Either<never, { priority: Priority }>

@Injectable()
export class CreatePriorityUseCase {
  constructor(private prioritiesRepository: PrioritiesRepository) {}

  async execute(
    data: CreatePriorityUseCaseRequest,
  ): Promise<CreatePriorityUseCaseResponse> {
    const priority = Priority.create(data)
    await this.prioritiesRepository.create(priority)
    return right({ priority })
  }
}
