import { Either, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ClientsRepository } from '../repositories/clients-repository'
import { Client } from '../../enterprise/entities/client'

interface CreateClientUseCaseRequest {
  name: string
  document: string
  zipCode: string
  street: string
  city: string
  state: string
  neighborhood: string
  number: string
  complement: string
  email: string
  phone: string
  instagram: string
}

type CreateClientUseCaseResponse = Either<never, { client: Client }>

@Injectable()
export class CreateClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute(
    data: CreateClientUseCaseRequest,
  ): Promise<CreateClientUseCaseResponse> {
    const count = await this.clientsRepository.count()
    const code = `CLI${String(count + 1).padStart(3, '0')}`

    const client = Client.create({ ...data, code })
    await this.clientsRepository.create(client)

    return right({ client })
  }
}
