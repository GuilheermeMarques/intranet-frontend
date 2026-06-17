import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { InMemoryPermissionsRepository } from 'test/repositories/in-memory-permissions-repository'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ListUsersUseCase } from './list-users'

let usersRepository: InMemoryUsersRepository
let permissionsRepository: InMemoryPermissionsRepository
let sut: ListUsersUseCase

describe('List Users', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    permissionsRepository = new InMemoryPermissionsRepository()
    sut = new ListUsersUseCase(usersRepository, permissionsRepository)
  })

  it('returns all users with their permission keys', async () => {
    usersRepository.items.push(makeUser({}, new UniqueEntityID('u1')))
    usersRepository.items.push(makeUser({}, new UniqueEntityID('u2')))
    permissionsRepository.assignments.push({ userId: 'u1', key: 'menu.dashboard' })
    permissionsRepository.assignments.push({ userId: 'u2', key: 'menu.clients' })

    const result = await sut.execute()

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.users).toHaveLength(2)
      for (const entry of result.value.users) {
        expect(Array.isArray(entry.permissions)).toBe(true)
      }
    }
  })
})
