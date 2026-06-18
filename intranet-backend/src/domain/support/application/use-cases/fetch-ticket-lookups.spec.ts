import { InMemoryTicketsRepository } from 'test/repositories/in-memory-tickets-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Ticket } from '../../enterprise/entities/ticket'
import { FetchTicketLookupsUseCase } from './fetch-ticket-lookups'

let ticketsRepository: InMemoryTicketsRepository
let sut: FetchTicketLookupsUseCase

function makeTicket(id: string, category: string, assignee: string) {
  return Ticket.create(
    {
      title: 'Login broken',
      description: 'Cannot log in',
      priorityId: 'p1',
      assignee,
      reporter: 'Bob',
      category,
    },
    new UniqueEntityID(id),
  )
}

describe('Fetch Ticket Lookups', () => {
  beforeEach(() => {
    ticketsRepository = new InMemoryTicketsRepository()
    sut = new FetchTicketLookupsUseCase(ticketsRepository)
  })

  it('returns distinct categories and assignees', async () => {
    ticketsRepository.items.push(
      makeTicket('1', 'Auth', 'Alice'),
      makeTicket('2', 'Billing', 'Bob'),
      makeTicket('3', 'Auth', 'Alice'),
    )

    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.categories).toEqual(['Auth', 'Billing'])
      expect(result.value.assignees).toEqual(['Alice', 'Bob'])
    }
  })
})
