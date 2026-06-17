import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { ClientsRepository } from '../repositories/clients-repository'
import { Client } from '../../enterprise/entities/client'

interface EditClientUseCaseRequest {
  id: string
  name?: string
  document?: string
  zipCode?: string
  street?: string
  city?: string
  state?: string
  neighborhood?: string
  number?: string
  complement?: string
  email?: string
  phone?: string
  instagram?: string
}

type EditClientUseCaseResponse = Either<
  ResourceNotFoundError,
  { client: Client }
>

@Injectable()
export class EditClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({
    id,
    ...data
  }: EditClientUseCaseRequest): Promise<EditClientUseCaseResponse> {
    const client = await this.clientsRepository.findById(id)
    if (!client) return left(new ResourceNotFoundError())

    if (data.name !== undefined) client.name = data.name
    if (data.document !== undefined) client.document = data.document
    if (data.zipCode !== undefined) client.zipCode = data.zipCode
    if (data.street !== undefined) client.street = data.street
    if (data.city !== undefined) client.city = data.city
    if (data.state !== undefined) client.state = data.state
    if (data.neighborhood !== undefined) client.neighborhood = data.neighborhood
    if (data.number !== undefined) client.number = data.number
    if (data.complement !== undefined) client.complement = data.complement
    if (data.email !== undefined) client.email = data.email
    if (data.phone !== undefined) client.phone = data.phone
    if (data.instagram !== undefined) client.instagram = data.instagram

    await this.clientsRepository.save(client)
    return right({ client })
  }
}
