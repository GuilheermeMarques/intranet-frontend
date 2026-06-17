import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { InMemoryPermissionsRepository } from 'test/repositories/in-memory-permissions-repository'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { SetUserPermissionsUseCase } from './set-user-permissions'

let usersRepository: InMemoryUsersRepository
let permissionsRepository: InMemoryPermissionsRepository
let sut: SetUserPermissionsUseCase

describe('Set User Permissions', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    permissionsRepository = new InMemoryPermissionsRepository()
    sut = new SetUserPermissionsUseCase(usersRepository, permissionsRepository)
  })

  it('replaces a user permission set', async () => {
    usersRepository.items.push(makeUser({}, new UniqueEntityID('u1')))
    permissionsRepository.assignments.push({ userId: 'u1', key: 'old.key' })

    const result = await sut.execute({ userId: 'u1', permissions: ['menu.dashboard', 'menu.clients'] })

    expect(result.isRight()).toBe(true)
    const keys = await permissionsRepository.findKeysByUserId('u1')
    expect(keys.sort()).toEqual(['menu.clients', 'menu.dashboard'])
  })

  it('returns ResourceNotFoundError for an unknown user', async () => {
    const result = await sut.execute({ userId: 'nope', permissions: [] })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
