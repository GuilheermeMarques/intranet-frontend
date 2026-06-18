import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { TicketsRepository } from '../repositories/tickets-repository'
import { Ticket } from '../../enterprise/entities/ticket'

interface CreateTicketUseCaseRequest {
  title: string
  description: string
  priorityId: string
  assignee: string
  reporter: string
  category: string
  tags?: string[]
}
type CreateTicketUseCaseResponse = Either<never, { ticket: Ticket }>

@Injectable()
export class CreateTicketUseCase {
  constructor(private ticketsRepository: TicketsRepository) {}

  async execute({
    title,
    description,
    priorityId,
    assignee,
    reporter,
    category,
    tags,
  }: CreateTicketUseCaseRequest): Promise<CreateTicketUseCaseResponse> {
    const ticket = Ticket.create({
      title,
      description,
      priorityId,
      assignee,
      reporter,
      category,
      tags: tags ?? [],
    })

    await this.ticketsRepository.create(ticket)
    return right({ ticket })
  }
}
