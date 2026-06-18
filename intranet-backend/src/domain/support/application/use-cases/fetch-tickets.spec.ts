import { InMemoryTicketsRepository } from 'test/repositories/in-memory-tickets-repository'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Ticket } from '../../enterprise/entities/ticket'
import { FetchTicketsUseCase } from './fetch-tickets'

let ticketsRepository: InMemoryTicketsRepository
let sut: FetchTicketsUseCase

function makeTicket(
  id: string,
  override: Partial<{
    title: string
    description: string
    status: 'todo' | 'inProgress' | 'inReview' | 'done'
  }> = {},
) {
  return Ticket.create(
    {
      title: override.title ?? 'Login broken',
      description: override.description ?? 'Cannot log in',
      priorityId: 'p1',
      assignee: 'Alice',
      reporter: 'Bob',
      category: 'Auth',
      status: override.status ?? 'todo',
    },
    new UniqueEntityID(id),
  )
}

describe('Fetch Tickets', () => {
  beforeEach(() => {
    ticketsRepository = new InMemoryTicketsRepository()
    sut = new FetchTicketsUseCase(ticketsRepository)
  })

  it('filters by status and search', async () => {
    ticketsRepository.items.push(
      makeTicket('1', { title: 'Login broken', status: 'todo' }),
      makeTicket('2', { title: 'Logout broken', status: 'done' }),
      makeTicket('3', { title: 'Payment issue', status: 'todo' }),
    )

    const result = await sut.execute({
      filters: { status: 'todo', search: 'login' },
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.tickets).toHaveLength(1)
      expect(result.value.tickets[0].id.toString()).toBe('1')
    }
  })
})
