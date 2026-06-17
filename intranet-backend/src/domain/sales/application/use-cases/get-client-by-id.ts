import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { ClientsRepository } from '../repositories/clients-repository'
import { Client } from '../../enterprise/entities/client'

interface GetClientByIdUseCaseRequest {
  id: string
}
type GetClientByIdUseCaseResponse = Either<
  ResourceNotFoundError,
  { client: Client }
>

@Injectable()
export class GetClientByIdUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({
    id,
  }: GetClientByIdUseCaseRequest): Promise<GetClientByIdUseCaseResponse> {
    const client = await this.clientsRepository.findById(id)
    if (!client) return left(new ResourceNotFoundError())
    return right({ client })
  }
}
