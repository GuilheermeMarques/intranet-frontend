import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { TicketsRepository } from '../repositories/tickets-repository'
import { Ticket } from '../../enterprise/entities/ticket'

interface GetTicketByIdUseCaseRequest {
  id: string
}
type GetTicketByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  { ticket: Ticket }
>

@Injectable()
export class GetTicketByIdUseCase {
  constructor(private ticketsRepository: TicketsRepository) {}

  async execute({
    id,
  }: GetTicketByIdUseCaseRequest): Promise<GetTicketByIdUseCaseResponse> {
    const ticket = await this.ticketsRepository.findById(id)
    if (!ticket) return left(new ResourceNotFoundError())
    return right({ ticket })
  }
}
