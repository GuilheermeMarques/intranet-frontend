import { InMemoryTicketsRepository } from 'test/repositories/in-memory-tickets-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Ticket } from '../../enterprise/entities/ticket'
import { DeleteTicketUseCase } from './delete-ticket'

let ticketsRepository: InMemoryTicketsRepository
let sut: DeleteTicketUseCase

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

describe('Delete Ticket', () => {
  beforeEach(() => {
    ticketsRepository = new InMemoryTicketsRepository()
    sut = new DeleteTicketUseCase(ticketsRepository)
  })

  it('deletes the ticket', async () => {
    ticketsRepository.items.push(makeTicket('t1'))

    const result = await sut.execute({ id: 't1' })

    expect(result.isRight()).toBe(true)
    expect(result.value).toBeNull()
    expect(ticketsRepository.items).toHaveLength(0)
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
