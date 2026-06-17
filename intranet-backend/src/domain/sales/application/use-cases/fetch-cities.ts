import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ClientsRepository } from '../repositories/clients-repository'

type FetchCitiesUseCaseResponse = Either<never, { cities: string[] }>

@Injectable()
export class FetchCitiesUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute(): Promise<FetchCitiesUseCaseResponse> {
    const cities = await this.clientsRepository.findDistinctCities()
    return right({ cities })
  }
}
