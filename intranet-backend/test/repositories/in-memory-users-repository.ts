import { UsersRepository } from '@/domain/iam/application/repositories/users-repository'
import { User } from '@/domain/iam/enterprise/entities/user'

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = []

  async findByEmail(email: string) {
    return this.items.find((item) => item.email === email) ?? null
  }

  async findById(id: string) {
    return this.items.find((item) => item.id.toString() === id) ?? null
  }

  async create(user: User) {
    this.items.push(user)
  }
}
