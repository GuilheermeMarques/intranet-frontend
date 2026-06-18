import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { PrioritiesRepository } from '../repositories/priorities-repository'
import { Priority } from '../../enterprise/entities/priority'

type FetchPrioritiesUseCaseResponse = Either<never, { priorities: Priority[] }>

@Injectable()
export class FetchPrioritiesUseCase {
  constructor(private prioritiesRepository: PrioritiesRepository) {}

  async execute(): Promise<FetchPrioritiesUseCaseResponse> {
    const priorities = await this.prioritiesRepository.findMany()
    return right({ priorities })
  }
}
