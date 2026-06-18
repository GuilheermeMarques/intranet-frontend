import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { TicketsRepository } from '../repositories/tickets-repository'
import { Ticket, TicketStatus } from '../../enterprise/entities/ticket'

interface EditTicketUseCaseRequest {
  id: string
  title?: string
  description?: string
  status?: TicketStatus
  priorityId?: string
  assignee?: string
  category?: string
  tags?: string[]
}
type EditTicketUseCaseResponse = Either<
  ResourceNotFoundError,
  { ticket: Ticket }
>

@Injectable()
export class EditTicketUseCase {
  constructor(private ticketsRepository: TicketsRepository) {}

  async execute({
    id,
    title,
    description,
    status,
    priorityId,
    assignee,
    category,
    tags,
  }: EditTicketUseCaseRequest): Promise<EditTicketUseCaseResponse> {
    const ticket = await this.ticketsRepository.findById(id)
    if (!ticket) return left(new ResourceNotFoundError())

    if (title !== undefined) ticket.title = title
    if (description !== undefined) ticket.description = description
    if (status !== undefined) ticket.status = status
    if (priorityId !== undefined) ticket.priorityId = priorityId
    if (assignee !== undefined) ticket.assignee = assignee
    if (category !== undefined) ticket.category = category
    if (tags !== undefined) ticket.tags = tags

    await this.ticketsRepository.save(ticket)
    return right({ ticket })
  }
}
