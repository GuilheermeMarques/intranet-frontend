import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import {
  ClientFilters,
  ClientsRepository,
} from '../repositories/clients-repository'
import { Client } from '../../enterprise/entities/client'

interface FetchClientsUseCaseRequest {
  filters: ClientFilters
}
type FetchClientsUseCaseResponse = Either<
  never,
  { clients: Client[]; cities: string[] }
>

@Injectable()
export class FetchClientsUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({
    filters,
  }: FetchClientsUseCaseRequest): Promise<FetchClientsUseCaseResponse> {
    const clients = await this.clientsRepository.findMany(filters)
    const cities = await this.clientsRepository.findDistinctCities()
    return right({ clients, cities })
  }
}
