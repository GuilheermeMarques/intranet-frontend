import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { TicketsRepository } from '../repositories/tickets-repository'
import { TicketMessagesRepository } from '../repositories/ticket-messages-repository'
import { Message, MessageType } from '../../enterprise/entities/message'

interface AddTicketMessageUseCaseRequest {
  ticketId: string
  author: string
  content: string
  type?: MessageType
  mentions?: string[]
}
type AddTicketMessageUseCaseResponse = Either<
  ResourceNotFoundError,
  { message: Message }
>

@Injectable()
export class AddTicketMessageUseCase {
  constructor(
    private ticketsRepository: TicketsRepository,
    private ticketMessagesRepository: TicketMessagesRepository,
  ) {}

  async execute({
    ticketId,
    author,
    content,
    type,
    mentions,
  }: AddTicketMessageUseCaseRequest): Promise<AddTicketMessageUseCaseResponse> {
    const ticket = await this.ticketsRepository.findById(ticketId)
    if (!ticket) return left(new ResourceNotFoundError())

    const message = Message.create({
      ticketId: new UniqueEntityID(ticketId),
      author,
      content,
      type,
      mentions,
    })

    await this.ticketMessagesRepository.create(message)
    return right({ message })
  }
}
