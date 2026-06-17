import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { UsersRepository } from '@/domain/iam/application/repositories/users-repository'
import { User } from '@/domain/iam/enterprise/entities/user'
import { PrismaUserMapper } from '../mappers/prisma-user-mapper'

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    return user ? PrismaUserMapper.toDomain(user) : null
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    return user ? PrismaUserMapper.toDomain(user) : null
  }

  async findMany(): Promise<User[]> {
    const users = await this.prisma.user.findMany({ orderBy: { name: 'asc' } })
    return users.map(PrismaUserMapper.toDomain)
  }

  async create(user: User): Promise<void> {
    await this.prisma.user.create({ data: PrismaUserMapper.toPrisma(user) })
  }
}
