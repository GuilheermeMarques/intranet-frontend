import { InMemoryTicketsRepository } from 'test/repositories/in-memory-tickets-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Ticket } from '../../enterprise/entities/ticket'
import { GetTicketByIdUseCase } from './get-ticket-by-id'

let ticketsRepository: InMemoryTicketsRepository
let sut: GetTicketByIdUseCase

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

describe('Get Ticket By Id', () => {
  beforeEach(() => {
    ticketsRepository = new InMemoryTicketsRepository()
    sut = new GetTicketByIdUseCase(ticketsRepository)
  })

  it('returns the ticket', async () => {
    ticketsRepository.items.push(makeTicket('t1'))

    const result = await sut.execute({ id: 't1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.ticket.id.toString()).toBe('t1')
    }
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
