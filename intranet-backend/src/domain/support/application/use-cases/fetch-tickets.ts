import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import {
  TicketFilters,
  TicketsRepository,
} from '../repositories/tickets-repository'
import { Ticket } from '../../enterprise/entities/ticket'

interface FetchTicketsUseCaseRequest {
  filters: TicketFilters
}
type FetchTicketsUseCaseResponse = Either<never, { tickets: Ticket[] }>

@Injectable()
export class FetchTicketsUseCase {
  constructor(private ticketsRepository: TicketsRepository) {}

  async execute({
    filters,
  }: FetchTicketsUseCaseRequest): Promise<FetchTicketsUseCaseResponse> {
    const tickets = await this.ticketsRepository.findMany(filters)
    return right({ tickets })
  }
}
