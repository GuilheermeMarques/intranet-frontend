import { Either, left, right } from '@/core/either'
import { Injectable } from '@nestjs/common'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { ClientsRepository } from '../repositories/clients-repository'

interface DeleteClientUseCaseRequest {
  id: string
}
type DeleteClientUseCaseResponse = Either<ResourceNotFoundError, null>

@Injectable()
export class DeleteClientUseCase {
  constructor(private clientsRepository: ClientsRepository) {}

  async execute({
    id,
  }: DeleteClientUseCaseRequest): Promise<DeleteClientUseCaseResponse> {
    const client = await this.clientsRepository.findById(id)
    if (!client) return left(new ResourceNotFoundError())
    await this.clientsRepository.delete(client)
    return right(null)
  }
}
