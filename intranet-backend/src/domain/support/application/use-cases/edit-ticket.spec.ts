import { InMemoryTicketsRepository } from 'test/repositories/in-memory-tickets-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Ticket } from '../../enterprise/entities/ticket'
import { EditTicketUseCase } from './edit-ticket'

let ticketsRepository: InMemoryTicketsRepository
let sut: EditTicketUseCase

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

describe('Edit Ticket', () => {
  beforeEach(() => {
    ticketsRepository = new InMemoryTicketsRepository()
    sut = new EditTicketUseCase(ticketsRepository)
  })

  it('patches only the provided fields', async () => {
    ticketsRepository.items.push(makeTicket('t1'))

    const result = await sut.execute({
      id: 't1',
      status: 'inProgress',
      tags: ['t1', 't2'],
    })

    expect(result.isRight()).toBe(true)
    const stored = ticketsRepository.items[0]
    expect(stored.status).toBe('inProgress')
    expect(stored.tags).toEqual(['t1', 't2'])
    expect(stored.title).toBe('Login broken')
  })

  it('returns ResourceNotFoundError when missing', async () => {
    const result = await sut.execute({ id: 'nope', title: 'X' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
