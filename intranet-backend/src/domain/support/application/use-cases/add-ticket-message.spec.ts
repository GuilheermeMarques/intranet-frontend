import { InMemoryTicketsRepository } from 'test/repositories/in-memory-tickets-repository'
import { InMemoryTicketMessagesRepository } from 'test/repositories/in-memory-ticket-messages-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Ticket } from '../../enterprise/entities/ticket'
import { AddTicketMessageUseCase } from './add-ticket-message'

let ticketsRepository: InMemoryTicketsRepository
let ticketMessagesRepository: InMemoryTicketMessagesRepository
let sut: AddTicketMessageUseCase

function makeTicket(id: string) {
  return Ticket.create(
    {
      title: 'Login broken',
      description: 'Cannot log in',
      priorityId: 'p1',
      assignee: 'Alice',
      reporter: 'Bob',
      category: 'Auth',
    },
    new UniqueEntityID(id),
  )
}

describe('Add Ticket Message', () => {
  beforeEach(() => {
    ticketsRepository = new InMemoryTicketsRepository()
    ticketMessagesRepository = new InMemoryTicketMessagesRepository(
      ticketsRepository,
    )
    sut = new AddTicketMessageUseCase(
      ticketsRepository,
      ticketMessagesRepository,
    )
  })

  it('adds a message to the ticket', async () => {
    ticketsRepository.items.push(makeTicket('t1'))

    const result = await sut.execute({
      ticketId: 't1',
      author: 'Alice',
      content: 'Looking into it',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.message.content).toBe('Looking into it')
      expect(result.value.message.type).toBe('comment')
    }
    expect(ticketsRepository.items[0].messages).toHaveLength(1)
  })

  it('returns ResourceNotFoundError when ticket missing', async () => {
    const result = await sut.execute({
      ticketId: 'nope',
      author: 'Alice',
      content: 'Hi',
    })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
