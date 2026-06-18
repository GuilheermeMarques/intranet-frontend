import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { TicketsRepository } from '../repositories/tickets-repository'

type FetchTicketLookupsUseCaseResponse = Either<
  never,
  { categories: string[]; assignees: string[] }
>

@Injectable()
export class FetchTicketLookupsUseCase {
  constructor(private ticketsRepository: TicketsRepository) {}

  async execute(): Promise<FetchTicketLookupsUseCaseResponse> {
    const categories = await this.ticketsRepository.findDistinctCategories()
    const assignees = await this.ticketsRepository.findDistinctAssignees()
    return right({ categories, assignees })
  }
}
