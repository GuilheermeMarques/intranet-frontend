import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { InMemoryPermissionsRepository } from 'test/repositories/in-memory-permissions-repository'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { GetMeUseCase } from './get-me'

let usersRepository: InMemoryUsersRepository
let permissionsRepository: InMemoryPermissionsRepository
let sut: GetMeUseCase

describe('Get Me', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    permissionsRepository = new InMemoryPermissionsRepository()
    sut = new GetMeUseCase(usersRepository, permissionsRepository)
  })

  it('returns the user and their permission keys', async () => {
    const user = makeUser({}, new UniqueEntityID('user-1'))
    usersRepository.items.push(user)
    permissionsRepository.assignments.push({ userId: 'user-1', key: 'menu.dashboard' })

    const result = await sut.execute({ userId: 'user-1' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.user.id.toString()).toBe('user-1')
      expect(result.value.permissions).toEqual(['menu.dashboard'])
    }
  })

  it('returns ResourceNotFoundError for an unknown user', async () => {
    const result = await sut.execute({ userId: 'nope' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
