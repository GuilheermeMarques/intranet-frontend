import { InMemoryTicketsRepository } from 'test/repositories/in-memory-tickets-repository'
import { CreateTicketUseCase } from './create-ticket'

let ticketsRepository: InMemoryTicketsRepository
let sut: CreateTicketUseCase

describe('Create Ticket', () => {
  beforeEach(() => {
    ticketsRepository = new InMemoryTicketsRepository()
    sut = new CreateTicketUseCase(ticketsRepository)
  })

  it('creates a ticket with defaults', async () => {
    const result = await sut.execute({
      title: 'Login broken',
      description: 'Cannot log in',
      priorityId: 'p1',
      assignee: 'Alice',
      reporter: 'Bob',
      category: 'Auth',
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.ticket.status).toBe('todo')
      expect(result.value.ticket.messages).toHaveLength(0)
      expect(result.value.ticket.tags).toEqual([])
    }
    expect(ticketsRepository.items).toHaveLength(1)
  })

  it('accepts tags', async () => {
    const result = await sut.execute({
      title: 'X',
      description: 'Y',
      priorityId: 'p1',
      assignee: 'Alice',
      reporter: 'Bob',
      category: 'Auth',
      tags: ['t1', 't2'],
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.ticket.tags).toEqual(['t1', 't2'])
    }
  })
})
