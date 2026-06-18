import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { TicketsRepository } from '../repositories/tickets-repository'

interface DeleteTicketUseCaseRequest {
  id: string
}
type DeleteTicketUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class DeleteTicketUseCase {
  constructor(private ticketsRepository: TicketsRepository) {}

  async execute({
    id,
  }: DeleteTicketUseCaseRequest): Promise<DeleteTicketUseCaseResponse> {
    const ticket = await this.ticketsRepository.findById(id)
    if (!ticket) return left(new ResourceNotFoundError())
    await this.ticketsRepository.delete(ticket)
    return right(null)
  }
}
