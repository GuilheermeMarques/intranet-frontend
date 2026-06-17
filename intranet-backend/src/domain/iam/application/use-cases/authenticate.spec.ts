import { InMemoryUsersRepository } from 'test/repositories/in-memory-users-repository'
import { FakeHasher } from 'test/cryptography/fake-hasher'
import { FakeEncrypter } from 'test/cryptography/fake-encrypter'
import { makeUser } from 'test/factories/make-user'
import { AuthenticateUseCase } from './authenticate'
import { WrongCredentialsError } from './errors/wrong-credentials-error'

let inMemoryUsersRepository: InMemoryUsersRepository
let fakeHasher: FakeHasher
let encrypter: FakeEncrypter
let sut: AuthenticateUseCase

describe('Authenticate', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository()
    fakeHasher = new FakeHasher()
    encrypter = new FakeEncrypter()
    sut = new AuthenticateUseCase(inMemoryUsersRepository, fakeHasher, encrypter)
  })

  it('should authenticate a user with valid credentials', async () => {
    const user = makeUser({
      email: 'admin@empresa.com',
      passwordHash: await fakeHasher.hash('admin123'),
    })
    inMemoryUsersRepository.items.push(user)

    const result = await sut.execute({ email: 'admin@empresa.com', password: 'admin123' })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value).toEqual({ accessToken: expect.any(String) })
    }
  })

  it('should not authenticate with a wrong password', async () => {
    const user = makeUser({
      email: 'admin@empresa.com',
      passwordHash: await fakeHasher.hash('admin123'),
    })
    inMemoryUsersRepository.items.push(user)

    const result = await sut.execute({ email: 'admin@empresa.com', password: 'wrong' })

    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })

  it('should not authenticate a non-existent user', async () => {
    const result = await sut.execute({ email: 'nobody@empresa.com', password: 'x' })
    expect(result.isLeft()).toBe(true)
    expect(result.value).toBeInstanceOf(WrongCredentialsError)
  })
})
