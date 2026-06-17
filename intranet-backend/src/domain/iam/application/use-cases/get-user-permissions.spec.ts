import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { InMemoryPermissionsRepository } from 'test/repositories/in-memory-permissions-repository'
import { makeUser } from 'test/factories/make-user'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { GetUserPermissionsUseCase } from './get-user-permissions'

let usersRepository: InMemoryUsersRepository
let permissionsRepository: InMemoryPermissionsRepository
let sut: GetUserPermissionsUseCase

describe('Get User Permissions', () => {
  beforeEach(() => {
    usersRepository = new InMemoryUsersRepository()
    permissionsRepository = new InMemoryPermissionsRepository()
    sut = new GetUserPermissionsUseCase(usersRepository, permissionsRepository)
  })

  it('returns the permission keys of a user', async () => {
    usersRepository.items.push(makeUser({}, new UniqueEntityID('u1')))
    permissionsRepository.assignments.push({ userId: 'u1', key: 'menu.clients' })
    permissionsRepository.assignments.push({ userId: 'u1', key: 'menu.budgets' })

    const result = await sut.execute({ userId: 'u1' })
    expect(result.isRight()).toBe(true)
    if (result.isRight()) expect(result.value.permissions.sort()).toEqual(['menu.budgets', 'menu.clients'])
  })

  it('returns ResourceNotFoundError for an unknown user', async () => {
    const result = await sut.execute({ userId: 'nope' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(ResourceNotFoundError)
  })
})
